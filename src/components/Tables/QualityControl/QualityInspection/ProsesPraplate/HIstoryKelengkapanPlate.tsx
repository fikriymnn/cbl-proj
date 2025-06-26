import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

function HistoryKelengkapanplate() {
  const [isMobile, setIsMobile] = useState(false);
  const kosong: any = [];
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const date = today.getDate();
  const currentDate = month + '/' + date + '/' + year;
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768); // Adjust the breakpoint as needed
  };

  useEffect(() => {
    handleResize();

    // Event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const [pondMesin, setPondMesin] = useState<any>();

  useEffect(() => {
    getPondMesin();
  }, [page]);

  const [noJo, setNoJo] = useState<any>();

  async function getPondMesin() {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiKelengkapanPlate`;
    try {
      const res = await axios.get(url, {
        params: {
          search: noJo,
          status: 'history',
          page: page,
          limit: 15,
        },
        withCredentials: true,
      });

      setPondMesin(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  function convertDatetimeToDate(datetime: any) {
    const dateObject = new Date(datetime);
    const day = dateObject.getDate().toString().padStart(2, '0');
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObject.getFullYear();

    return `${year}/${month}/${day}`;
  }

  const toggleRowExpansion = (index: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  const tanggal = convertDatetimeToDate(new Date());

  return (
    <>
      <main className="overflow-x-scroll">
        <div className="min-w-[700px] bg-white rounded-xl">
          <div className="flex w-full justify-end h-full items-center border-b-8 border-[#D8EAFF]">
            <div className="flex flex-col gap-1 w-[20%] px-4 py-2 ">
              <p className=" my-auto text-xs text-primary font-semibold ">
                Cari
              </p>
              <input
                className="rounded-md h-8 bg-[#D8EAFF] px-2 w-full"
                placeholder="Nomor Jo"
                type="text"
                onChange={(e) => setNoJo(e.target.value)}
              ></input>
            </div>
            <div className="flex flex-col  w-[15%] px-4 py-2   gap-4">
              <p className=" my-auto text-xs text-primary font-semibold "></p>
              <button
                onClick={() => {
                  getPondMesin();
                }}
                className="bg-primary text-white  rounded-md px-1 py-1 "
              >
                Cari
              </button>
            </div>
          </div>
          <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
            <div className="grid grid-cols-12 px-4 py-4 border-b-8 border-[#D8EAFF]  ">
              <label className="text-neutral-500 text-sm font-semibold col-span-2 ">
                No. JO
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                No. IO
              </label>
              <label className="text-neutral-500 text-sm font-semibold ">
                Status JO
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Produk
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Customer
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                Mesin
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                Total Warna
              </label>
            </div>
            <div className="w-2 h-full "></div>
            {pondMesin != null &&
              pondMesin.data?.map((data: any, i: any) => (
                <React.Fragment key={i}>
                  <div className="grid grid-cols-12 border-b-8 border-[#D8EAFF] gap-2 items-center">
                    <div
                      className={`w-full h-full sticky left-0 z-20   col-span-2 gap-4 flex items-center`}
                    >
                      <div
                        className={`w-2 h-full sticky left-0 z-20 bg-green-600  `}
                      ></div>
                      <label className="text-neutral-500 text-sm font-semibold ">
                        {data.no_jo}
                      </label>
                    </div>

                    <label className="text-neutral-500 text-sm font-semibold col-span-2">
                      {data.no_io}
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold ">
                      {data.status_jo}
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold col-span-2">
                      {data.nama_produk}
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold col-span-2">
                      {data.customer}
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold ">
                      {data.mesin}
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold ">
                      {data.total_warna}
                    </label>
                    <div className="justify-end flex pr-2 ">
                      <button
                        onClick={() => toggleRowExpansion(i)}
                        className={`uppercase px-4 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`}
                      >
                        {expandedRows.has(i) ? 'TUTUP' : 'DETAIL'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail Section */}
                  {expandedRows.has(i) && (
                    <div className="col-span-12 bg-gray-50 border-b-8 border-[#D8EAFF]">
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">
                          Detail Inspeksi Kelengkapan Plate
                        </h3>

                        {/* Detail Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <label className="text-xs text-gray-500 font-medium">
                              No. Dokumen
                            </label>
                            <p className="text-sm font-semibold text-gray-700">
                              {data.no_doc || 'N/A'}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <label className="text-xs text-gray-500 font-medium">
                              Qty JO
                            </label>
                            <p className="text-sm font-semibold text-gray-700">
                              {data.qty_jo?.toLocaleString() || 'N/A'}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <label className="text-xs text-gray-500 font-medium">
                              NO JO
                            </label>
                            <p className="text-sm font-semibold text-gray-700">
                              {data.no_jo?.toLocaleString() || 'N/A'}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <label className="text-xs text-gray-500 font-medium">
                              NO IO
                            </label>
                            <p className="text-sm font-semibold text-gray-700">
                              {data.no_io?.toLocaleString() || 'N/A'}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <label className="text-xs text-gray-500 font-medium">
                              Tanggal
                            </label>
                            <p className="text-sm font-semibold text-gray-700">
                              {data.tanggal
                                ? convertDatetimeToDate(data.tanggal)
                                : 'N/A'}{' '}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <label className="text-xs text-gray-500 font-medium">
                              Jam
                            </label>
                            <p
                              className={`text-sm font-semibold 
                              `}
                            >
                              {data.jam || 'N/A'}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <label className="text-xs text-gray-500 font-medium">
                              Hasil Check
                            </label>
                            <p
                              className={`text-sm font-semibold 
                              `}
                            >
                              {data.hasil_check || 'N/A'}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <label className="text-xs text-gray-500 font-medium">
                              Status
                            </label>
                            <p className="text-sm font-semibold text-gray-700">
                              {data.status || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* Inspector Information */}
                        {data.inspektor && (
                          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                            <h4 className="text-md font-semibold text-gray-700 mb-3">
                              Informasi Inspektor
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div>
                                <label className="text-xs text-gray-500 font-medium">
                                  Nama
                                </label>
                                <p className="text-sm font-semibold text-gray-700">
                                  {data.inspektor.nama || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Notes and Additional Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {data.catatan && (
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <label className="text-xs text-gray-500 font-medium">
                                Catatan
                              </label>
                              <p className="text-sm font-semibold text-gray-700 mt-1">
                                {data.catatan}
                              </p>
                            </div>
                          )}
                          {data.keterangan && (
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <label className="text-xs text-gray-500 font-medium">
                                Keterangan
                              </label>
                              <p className="text-sm font-semibold text-gray-700 mt-1">
                                {data.keterangan}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Timestamps */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <label className="text-xs text-gray-500 font-medium">
                              Created At
                            </label>
                            <p className="text-sm font-semibold text-gray-700">
                              {data.createdAt
                                ? convertDatetimeToDate(data.createdAt)
                                : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <label className="text-xs text-gray-500 font-medium">
                              Updated At
                            </label>
                            <p className="text-sm font-semibold text-gray-700">
                              {data.updatedAt
                                ? convertDatetimeToDate(data.updatedAt)
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
          </div>
        </div>
        <div className="w-full flex justify-center mt-5 ">
          <Stack spacing={2}>
            <Pagination
              count={pondMesin?.total_page}
              color="primary"
              onChange={(e, i) => {
                setPage(i);
                console.log(i);
              }}
            />
          </Stack>
        </div>
      </main>
    </>
  );
}

export default HistoryKelengkapanplate;
