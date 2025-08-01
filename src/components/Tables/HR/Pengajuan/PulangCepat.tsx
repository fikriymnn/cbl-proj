import React, { useEffect, useState } from 'react';

import axios from 'axios';

import convertTimeStampToDate from '../../../../utils/converDateTime';
import dateOnly from '../../../../utils/convertDateOnly';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import Loading from '../../../Loading';

function IncomingPulangCepat() {
  const [isLoading, setIsLoading] = useState(false);
  const [pulangCepat, setPulangCepat] = useState<any>();

  useEffect(() => {
    getPulangCepat();
  }, []);

  async function getPulangCepat() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanPulangCepat`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          status_tiket: 'incoming',
        },
        withCredentials: true,
      });
      setIsLoading(false);
      setPulangCepat(res.data);
      console.log(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }
  const [catatanHr, setcatatanHr] = useState<any>();

  async function approveIzin(id: any, index: any) {
    if (catatanHr == null || catatanHr.trim() === '') {
      alert('Catatan Wajib Diisi');
      return;
    }
    const url = `${
      import.meta.env.VITE_API_LINK
    }/hr/pengajuanPulangCepat/approve/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {
          catatan_hr: catatanHr,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getPulangCepat();
      console.log(res.data);
      const updatedModalStates = [...showModal];
      updatedModalStates[index] = false;
      setShowModal(updatedModalStates);
      setcatatanHr(''); // Reset catatan after action
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function rejectIzin(id: any, index: number) {
    if (catatanHr == null || catatanHr.trim() === '') {
      alert('Catatan Wajib Diisi');
      return;
    }
    if (
      window.confirm(
        'Apakah Anda yakin ingin menolak pengajuan Pulang Cepat ini?',
      )
    ) {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/hr/pengajuanPulangCepat/reject/${id}`;
      try {
        setIsLoading(true);
        const res = await axios.put(
          url,
          {
            catatan_hr: catatanHr,
          },
          {
            withCredentials: true,
          },
        );
        setIsLoading(false);
        getPulangCepat();
        console.log(res.data);
        const updatedModalStates = [...showModal];
        updatedModalStates[index] = false;
        setShowModal(updatedModalStates);
        setcatatanHr(''); // Reset catatan after action
      } catch (error: any) {
        setIsLoading(false);
        console.log(error);
      }
    }
  }

  const [showModal, setShowModal] = useState<boolean[]>([]);

  const openModalModal = (i: any) => {
    const onchangeVal: any = [...showModal];
    onchangeVal[i] = true;
    setShowModal(onchangeVal);
    setcatatanHr(''); // Reset catatan when opening modal
  };

  const closeModalModal = (i: any) => {
    const onchangeVal: any = [...showModal];
    onchangeVal[i] = false;
    setShowModal(onchangeVal);
    setcatatanHr(''); // Reset catatan when closing modal
  };

  // Helper function to get department name
  const getDepartmentName = (data: any) => {
    return (
      data.karyawan_pengaju?.biodata_karyawan?.[0]?.department
        ?.nama_department ||
      data.nama_department ||
      'N/A'
    );
  };

  return (
    <>
      <main className="overflow-x-scroll">
        {isLoading && <Loading />}
        <div className="min-w-[700px] bg-white rounded-xl">
          <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
            <div className="grid grid-cols-12 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
              <label className="text-neutral-500 text-sm font-semibold ">
                No
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-3">
                Tanggal
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Sumber
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Personnel
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Jam Pulang
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2 flex justify-end">
                Action
              </label>
            </div>
            <div className="w-2 h-full "></div>
            {pulangCepat?.data?.map((data: any, i: any) => {
              return (
                <div
                  key={data.id}
                  className="grid grid-cols-12 border-b-8 border-[#D8EAFF] gap-2 items-center px-10"
                >
                  <label className="text-neutral-500 text-sm font-semibold ">
                    {i + 1}
                  </label>
                  <div className="flex flex-col gap-1 col-span-3">
                    {convertTimeStampToDate(data.tanggal)}
                  </div>

                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    {getDepartmentName(data)}
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    {data.karyawan?.name || 'N/A'}
                  </label>
                  <label className="text-neutral-500 text-sm font-semibold col-span-2">
                    {data.jam_pulang || 'N/A'}
                  </label>
                  <div className="justify-end flex pr-2 col-span-2">
                    <button
                      onClick={() => openModalModal(i)}
                      className={`uppercase px-6 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`}
                    >
                      ACTION
                    </button>
                    {showModal[i] == true && (
                      <ModalKosongan
                        isOpen={showModal[i]}
                        onClose={() => closeModalModal(i)}
                        judul={'Permohonan Pulang Cepat'}
                      >
                        <div className="grid grid-cols-2 gap-2 px-4 py-4">
                          <div className="flex flex-col gap-2 ">
                            <div className="flex flex-col ">
                              <label
                                htmlFor=""
                                className="text-black text-xs font-bold"
                              >
                                NAMA PERSONNEL
                              </label>
                              <label
                                htmlFor=""
                                className="text-[#7a7a7a] text-xl font-normal"
                              >
                                {data.karyawan?.name || 'N/A'}
                              </label>
                            </div>
                            <div className="flex flex-col ">
                              <label
                                htmlFor=""
                                className="text-black text-xs font-bold"
                              >
                                DEPARTEMEN
                              </label>
                              <label
                                htmlFor=""
                                className="text-[#7a7a7a] text-xl font-normal"
                              >
                                {getDepartmentName(data)}
                              </label>
                            </div>
                            <div className="flex flex-col ">
                              <label
                                htmlFor=""
                                className="text-black text-xs font-bold"
                              >
                                TANGGAL PENGAJUAN
                              </label>
                              <label
                                htmlFor=""
                                className="text-[#7a7a7a] text-xl font-normal"
                              >
                                {dateOnly(data.createdAt)}
                              </label>
                            </div>
                            <div className="flex flex-col ">
                              <label
                                htmlFor=""
                                className="text-black text-xs font-bold"
                              >
                                SUPERVISOR
                              </label>
                              <label
                                htmlFor=""
                                className="text-[#7a7a7a] text-xl font-normal"
                              >
                                {data.karyawan_pengaju?.name || 'N/A'}
                              </label>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ">
                            <div className="flex flex-col ">
                              <label
                                htmlFor=""
                                className="text-black text-xs font-bold"
                              >
                                TANGGAL PULANG CEPAT
                              </label>
                              <label
                                htmlFor=""
                                className="text-[#016ae6] text-xl font-normal"
                              >
                                {dateOnly(data.tanggal)}
                              </label>
                            </div>
                            <div className="flex flex-col ">
                              <label
                                htmlFor=""
                                className="text-black text-xs font-bold"
                              >
                                JAM PULANG
                              </label>
                              <label
                                htmlFor=""
                                className="text-[#016ae6] text-xl font-normal"
                              >
                                {data.jam_pulang || 'N/A'}
                              </label>
                            </div>
                            <div className="flex flex-col ">
                              <label
                                htmlFor=""
                                className="text-black text-xs font-bold"
                              >
                                TIPE IZIN
                              </label>
                              <label
                                htmlFor=""
                                className="text-[#016ae6] text-xl font-normal"
                              >
                                {data.type_izin || 'N/A'}
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col w-full px-4">
                          <label
                            htmlFor=""
                            className="text-black text-xs font-bold"
                          >
                            ALASAN PULANG CEPAT
                          </label>
                          <label
                            htmlFor=""
                            className="text-[#7a7a7a] text-xl font-normal"
                          >
                            {data.alasan || 'N/A'}
                          </label>
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
                            value={catatanHr || ''}
                            onChange={(e) => setcatatanHr(e.target.value)}
                            placeholder="Masukkan catatan HR..."
                            className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                          ></textarea>
                        </div>
                        <div className="flex gap-2 w-full px-4 pt-1">
                          <button
                            disabled={isLoading}
                            onClick={() => approveIzin(data.id, i)}
                            className="bg-green-500 w-[50%] rounded-md px-3 py-3 text-white font-semibold text-sm disabled:opacity-50"
                          >
                            {isLoading ? 'MEMPROSES...' : 'TERIMA'}
                          </button>
                          <button
                            disabled={isLoading}
                            onClick={() => rejectIzin(data.id, i)}
                            className="bg-red-500 w-[50%] rounded-md px-3 py-3 text-white font-semibold text-sm disabled:opacity-50"
                          >
                            {isLoading ? 'MEMPROSES...' : 'TOLAK'}
                          </button>
                        </div>
                      </ModalKosongan>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}

export default IncomingPulangCepat;
