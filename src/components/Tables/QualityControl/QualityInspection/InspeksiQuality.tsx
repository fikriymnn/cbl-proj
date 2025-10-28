import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function InspeksiQuality() {
  const today = new Date();

  function convertDatetimeToDate(datetime: any) {
    const dateObject = new Date(datetime);
    const day = dateObject.getDate().toString().padStart(2, '0');
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObject.getFullYear();
    const hours = dateObject.getHours().toString().padStart(2, '0');
    const minutes = dateObject.getMinutes().toString().padStart(2, '0');

    return `${year}/${month}/${day} `;
  }

  const tanggal = convertDatetimeToDate(new Date());

  const inspection = [
    {
      nama: 'INCOMING BAHAN',
      path: '/qc/inspection/list',
    },
    {
      nama: 'PENGECEKAN PRA-PLATE',
      path: '/qc/inspection/praplate',
    },
    {
      nama: 'PROSES POTONG',
      path: '/qc/inspection/potong',
    },
    {
      nama: 'PROSES CETAK',
      path: '/qc/inspection/cetak',
    },
    {
      nama: 'PROSES COATING',
      path: '/qc/inspection/coating',
    },
    {
      nama: 'PROSES POND',
      path: '/qc/inspection/pond',
    },
    {
      nama: 'PROSES LEM',
      path: '/qc/inspection/lem',
    },
    {
      nama: 'SAMPLING HASIL RABUT',
      path: '/qc/inspection/sampling-hasil-rabut',
    },
    {
      nama: 'SORTIR RS',
      path: '/qc/inspection/barang-rusak',
    },
    {
      nama: 'PROSES LIPAT',
      path: '/qc/inspection/lipat',
    },
    {
      nama: 'AMPAR HASIL LEM',
      path: '/qc/inspection/ampar-hasil-lem',
    },
    {
      nama: 'INCOMING OUTSOURCING',
      path: '/qc/inspection/incoming-outsourcing',
    },
    {
      nama: 'INCOMING OUTSOURCING BARANG JADI',
      path: '/qc/inspection/outsourcing-barang-jadi',
    },
    {
      nama: 'FINAL INSPECTION',
      path: '/qc/inspection/final',
    },
  ];

  const getColorClass = (nama: string) => {
    const greenItems = [
      'INCOMING BAHAN',
      'PROSES POTONG',
      'PENGECEKAN PRA-PLATE',
    ];
    return greenItems.includes(nama) ? 'bg-green-600' : 'bg-[#DE8500]';
  };

  return (
    <>
      <main className="overflow-x-scroll">
        <div className="min-w-[700px] bg-white rounded-xl">
          <p className="text-[14px] font-semibold w-full border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12">
            {tanggal}
          </p>
          <div className="w-full h-full flex-col border-b-8 border-[#D8EAFF]">
            <div className="w-2 h-full"></div>
            {inspection.map((data, i) => (
              <section
                key={i}
                className="flex justify-center w-full h-[59px] border-b-8 border-[#D8EAFF] text-[14px] text-black"
              >
                <div
                  className={`w-2 h-full sticky left-0 z-20 ${getColorClass(
                    data.nama,
                  )}`}
                ></div>

                <div className="w-full h-full flex flex-col justify-center relative">
                  <div className="ps-7 w-full flex">
                    <div className="flex flex-col justify-center text-stone-500 text-sm font-bold sticky left-2 ps-3 md:ps-0 bg-white">
                      <p>{data.nama}</p>
                    </div>
                  </div>
                </div>

                <div className="justify-end pr-4">
                  <Link to={data.path}>
                    <button className="uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold py-2 my-2 hover:bg-blue-400 border bg-blue-600 border-blue-600 justify-center">
                      PILIH
                    </button>
                  </Link>
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export default InspeksiQuality;
