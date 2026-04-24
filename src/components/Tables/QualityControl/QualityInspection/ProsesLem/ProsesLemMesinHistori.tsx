import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import convertTimeStampToDate from '../../../../../utils/converDateTime';

function ProsesLemMesinHistory() {
  const [isMobile, setIsMobile] = useState(false);
  const kosong: any = [];
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const date = today.getDate();
  const currentDate = month + '/' + date + '/' + year;
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const [cetakMesin, setCetakMesin] = useState<any>();

  useEffect(() => {
    getLemMesin();
  }, [page]);
  const [noJo, setNoJo] = useState<any>();
  async function getLemMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiLem`;
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

      setCetakMesin(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

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
                  getLemMesin();
                }}
                className="bg-primary text-white  rounded-md px-1 py-1 "
              >
                Cari
              </button>
            </div>
          </div>
          <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
            <div
              className="grid px-10 py-4 border-b-8 border-[#D8EAFF] gap-2"
              style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}
            >
              <label className="text-neutral-500 text-sm font-semibold ">
                MESIN
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                No. JO / IO
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Nama Produk
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Operator
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Inspektor
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-1">
                Periode
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Tanggal
              </label>
            </div>
            <div className="w-2 h-full "></div>
            {cetakMesin?.data.map((data: any, i: any) => {
              const tglTicket = convertTimeStampToDate(data.createdAt);
              const periodeCount =
                data.inspeksi_lem_periode?.[0]?.inspeksi_lem_periode_point
                  ?.length ?? 0;
              return (
                <>
                  <div
                    className="grid border-b-8 border-[#D8EAFF] gap-2 items-center"
                    style={{
                      gridTemplateColumns: 'repeat(13, minmax(0, 1fr))',
                    }}
                  >
                    <div
                      className={`w-full h-full sticky left-0 z-20  gap-8  flex items-center`}
                    >
                      <div
                        className={`w-2 h-full sticky left-0 z-20 bg-green-600  `}
                      ></div>
                      <label className="text-neutral-500 text-sm font-semibold ">
                        {data.mesin}
                      </label>
                    </div>

                    <label className="text-neutral-500 text-sm font-semibold col-span-2 pl-6">
                      {data.no_jo} / {data.no_io}
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold col-span-2 pl-3 line-clamp-3">
                      {data.nama_produk}
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold col-span-2">
                      {data.operator}
                    </label>
                    <div className="text-neutral-500 text-sm font-semibold flex flex-col col-span-2">
                      <label>
                        Awal :
                        {
                          data.inspeksi_lem_awal[0]?.inspeksi_lem_awal_point[0]
                            ?.inspektor?.nama
                        }
                      </label>
                      <label>
                        Periode :
                        {
                          data.inspeksi_lem_periode[0]
                            ?.inspeksi_lem_periode_point[0]?.inspektor?.nama
                        }
                      </label>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold rounded-full w-7 h-7">
                        {periodeCount}
                      </span>
                    </div>
                    <label className="text-neutral-500 text-sm font-semibold col-span-2">
                      {tglTicket}
                    </label>
                    <div className="justify-end flex pr-2 ">
                      <>
                        <Link to={`/qc/inspection/lem/jenis/${data.id}`}>
                          <button
                            className={`uppercase px-3 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`}
                          >
                            PILIH
                          </button>
                        </Link>
                      </>
                    </div>
                  </div>
                </>
              );
            })}
          </div>
        </div>
        <div className="w-full flex justify-center mt-5 ">
          <Stack spacing={2}>
            <Pagination
              count={cetakMesin?.total_page}
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

export default ProsesLemMesinHistory;
