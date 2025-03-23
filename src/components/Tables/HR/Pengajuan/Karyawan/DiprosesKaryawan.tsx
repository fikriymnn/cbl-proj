import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import convertTimeStampToDate from '../../../../../utils/converDateTime';
import dateOnly from '../../../../../utils/convertDateOnly';
import ModalKosongan from '../../../../Modals/Qc/NCR/NCRResponQC';
import Loading from '../../../../Loading';

function DiprosesKaryawan() {
  const [isLoading, setIsLoading] = useState(false);
  const [izin, setIzin] = useState<any>();

  useEffect(() => {
    getIzin();
  }, []);

  async function getIzin() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanKaryawan`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          status_tiket: 'history',
        },
        withCredentials: true,
      });
      setIsLoading(false);
      setIzin(res.data);
      console.log(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const [showModal, setShowModal] = useState<boolean[]>([]);
  const openModalModal = (i: any) => {
    const onchangeVal: any = [...showModal];
    onchangeVal[i] = true;

    setShowModal(onchangeVal);
  };
  const closeModalModal = (i: any) => {
    const onchangeVal: any = [...showModal];
    onchangeVal[i] = false;

    setShowModal(onchangeVal);
  };

  return (
    <>
      <main className="overflow-x-scroll">
        {isLoading && <Loading />}
        <div className="min-w-[700px] bg-white rounded-xl">
          <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
            <div className="grid grid-cols-12 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                No. Tanggal Diajukan
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Sumber
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-3">
                Jabatan / Department Yang Diajukan
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Jenis Kelamin
              </label>
              <label className="text-neutral-500 text-sm font-semibold ">
                Jumlah
              </label>
              <label className="text-neutral-500 text-sm font-semibold ">
                Status
              </label>
            </div>
            <div className="w-2 h-full "></div>
            {izin?.data?.map((data: any, i: any) => {
              const tanggal = dateOnly(data.createdAt);

              // const endDate = new Date(data.sampai);
              // const Onedaylater = new Date();
              // Onedaylater.setDate(endDate.getDate() + 1);
              // const formattedDate = Onedaylater.toLocaleDateString();
              return (
                <>
                  <div className="grid grid-cols-12 border-b-8 border-[#D8EAFF] gap-2 items-center px-10">
                    <div className="flex flex-col gap-1 col-span-2">
                      <label className="text-neutral-500 text-sm font-semibold ">
                        {i + 1}. {dateOnly(data.diajukan_tanggal)}
                      </label>
                    </div>

                    <label className="text-neutral-500 text-sm font-semibold col-span-2">
                      {
                        data.karyawan_pengaju?.biodata_karyawan[0]?.department
                          ?.nama_department
                      }
                    </label>

                    <div className="flex flex-col gap-1 col-span-3">
                      <label className="text-neutral-500 text-sm font-semibold ">
                        Department : {data.department?.nama_department || '-'}
                      </label>
                      <label className="text-neutral-500 text-sm font-semibold ">
                        Jabatan : {data.jabatan?.nama_jabatan || '-'}
                      </label>
                    </div>
                    <label className="text-neutral-500 text-sm font-semibold col-span-2">
                      {data.jenis_kelamin || '-'}
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold ">
                      {data.jumlah_dibutuhkan || '-'}
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold uppercase">
                      {data.status || '-'}
                    </label>
                    <div className="justify-end flex pr-2 col-span-1">
                      <>
                        <button
                          onClick={() => openModalModal(i)}
                          className={`uppercase px-3 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                        >
                          DETAIL
                        </button>
                        {showModal[i] == true && (
                          <>
                            <ModalKosongan
                              isOpen={showModal[i]}
                              onClose={() => closeModalModal(i)}
                              judul={'Permohonan Penambahan Karyawan'}
                            >
                              <>
                                <div className="space-y-4 mb-6">
                                  <div className="flex">
                                    <label className="w-1/4 font-semibold">
                                      Pemohon
                                    </label>
                                    <span className="w-8 text-center">:</span>
                                    <input
                                      type="text"
                                      value={data.karyawan_pengaju?.name}
                                      readOnly
                                      className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                    />
                                  </div>

                                  <div className="flex">
                                    <label className="w-1/4 font-semibold">
                                      Department
                                    </label>
                                    <span className="w-8 text-center">:</span>
                                    <input
                                      type="text"
                                      value={data.department?.nama_department}
                                      readOnly
                                      className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                    />
                                  </div>

                                  <div className="flex">
                                    <label className="w-1/4 font-semibold">
                                      Jabatan
                                    </label>
                                    <span className="w-8 text-center">:</span>
                                    <input
                                      type="text"
                                      value={data.jabatan?.nama_jabatan}
                                      readOnly
                                      className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                    />
                                  </div>
                                </div>

                                <div className="mb-6">
                                  <h3 className="font-bold mb-3">
                                    PERSYARATAN:
                                  </h3>
                                  <div className="space-y-3 pl-6">
                                    <div className="flex">
                                      <label className="w-1/4 font-semibold">
                                        1. Jenis kelamin
                                      </label>
                                      <span className="w-8 text-center">:</span>
                                      <input
                                        readOnly
                                        type="text"
                                        className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                        value={data.jenis_kelamin}
                                      />
                                    </div>

                                    <div className="flex">
                                      <label className="w-1/4 font-semibold">
                                        2. Jumlah
                                      </label>
                                      <span className="w-8 text-center">:</span>
                                      <input
                                        readOnly
                                        type="number"
                                        className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                        value={data.jumlah_dibutuhkan}
                                      />
                                    </div>

                                    <div className="flex">
                                      <label className="w-1/4 font-semibold">
                                        3. Pendidikan
                                      </label>
                                      <span className="w-8 text-center">:</span>
                                      <input
                                        type="text"
                                        readOnly
                                        className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                        value={data.pendidikan}
                                      />
                                    </div>

                                    <div className="flex">
                                      <label className="w-1/4 font-semibold">
                                        4. Usia
                                      </label>
                                      <span className="w-8 text-center">:</span>
                                      <input
                                        type="text"
                                        readOnly
                                        className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                        value={data.usia}
                                      />
                                    </div>

                                    <div className="flex">
                                      <label className="w-1/4 font-semibold">
                                        5. Pengalaman
                                      </label>
                                      <span className="w-8 text-center">:</span>
                                      <input
                                        type="text"
                                        readOnly
                                        className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                        value={data.pengalaman}
                                      />
                                    </div>

                                    <div className="flex">
                                      <label className="w-1/4 font-semibold">
                                        6. Syarat khusus
                                      </label>
                                      <span className="w-8 text-center">:</span>
                                      <div className="flex-1 space-y-2">
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            readOnly
                                            className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                            value={data.syarat_khusus}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col w-full px-4 ">
                                  <label
                                    htmlFor=""
                                    className="text-black text-xs font-bold"
                                  >
                                    RESPON HR
                                    <span className="text-red-600">*</span>
                                  </label>
                                  <textarea
                                    readOnly
                                    value={data.catatan_hr}
                                    className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                  ></textarea>
                                </div>
                              </>
                            </ModalKosongan>
                          </>
                        )}
                      </>
                    </div>
                  </div>
                </>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}

export default DiprosesKaryawan;
