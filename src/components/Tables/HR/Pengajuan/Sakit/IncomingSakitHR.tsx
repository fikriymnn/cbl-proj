import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import dateOnly from '../../../../../utils/convertDateOnly';
import ModalKosongan from '../../../../Modals/Qc/NCR/NCRResponQC';
import Loading from '../../../../Loading';

function IncomingSakitHR() {
  const [isLoading, setIsLoading] = useState(false);
  const [sakit, setSakit] = useState<any>();

  // Fullscreen image state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState('');

  const openFullscreen = (imageUrl: string) => {
    setFullscreenImage(imageUrl);
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setFullscreenImage('');
  };

  useEffect(() => {
    getSakit();
  }, []);

  async function getSakit() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanSakit`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          status_tiket: 'incoming',
        },
        withCredentials: true,
      });
      setIsLoading(false);
      setSakit(res.data);
      console.log(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const [catatanHr, setcatatanHr] = useState<any>();

  async function approveSakit(id: any, index: any) {
    if (catatanHr == null) {
      alert('Catatan Wajib Diisi');
      return;
    }
    const url = `${
      import.meta.env.VITE_API_LINK
    }/hr/pengajuanSakit/approve/${id}`;
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
      getSakit();
      console.log(res.data);
      const updatedModalStates = [...showModal];
      updatedModalStates[index] = false;
      setShowModal(updatedModalStates);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function rejectSakit(id: any, index: number) {
    if (catatanHr == null) {
      alert('Catatan Wajib Diisi');
      return;
    }
    if (
      window.confirm('Apakah Anda yakin ingin menolak pengajuan sakit ini?')
    ) {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/hr/pengajuanSakit/reject/${id}`;
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
        getSakit();
        console.log(res.data);
        const updatedModalStates = [...showModal];
        updatedModalStates[index] = false;
        setShowModal(updatedModalStates);
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
  };
  const closeModalModal = (i: any) => {
    const onchangeVal: any = [...showModal];
    onchangeVal[i] = false;
    setShowModal(onchangeVal);
  };

  return (
    <>
      {/* Fullscreen Image Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-[99] overflow-auto"
          onClick={closeFullscreen}
        >
          <div className="relative w-full min-h-screen flex justify-center p-4">
            <img
              src={fullscreenImage}
              alt="Fullscreen"
              className="max-w-full h-auto block"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="fixed top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-colors text-xl font-bold"
              onClick={closeFullscreen}
            >
              ×
            </button>
          </div>
        </div>
      )}

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
            </div>
            <div className="w-2 h-full "></div>
            {sakit?.data?.map((data: any, i: any) => {
              const tanggal = dateOnly(data.createdAt);
              return (
                <>
                  <div className="grid grid-cols-12 border-b-8 border-[#D8EAFF] gap-2 items-center px-10">
                    <label className="text-neutral-500 text-sm font-semibold ">
                      {i + 1}
                    </label>
                    <div className="flex flex-col gap-1 col-span-3">
                      <label className="text-neutral-500 text-sm font-semibold ">
                        Dari : {dateOnly(data.dari)}
                      </label>
                      <label className="text-neutral-500 text-sm font-semibold ">
                        Sampai :{dateOnly(data.sampai)}
                      </label>
                    </div>

                    <label className="text-neutral-500 text-sm font-semibold col-span-2">
                      {
                        data.karyawan.biodata_karyawan[0]?.department
                          ?.nama_department
                      }
                    </label>
                    <label className="text-neutral-500 text-sm font-semibold col-span-2">
                      {data.karyawan?.name}
                    </label>
                    <div className="justify-end flex pr-2 col-span-4">
                      <>
                        <button
                          onClick={() => openModalModal(i)}
                          className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`}
                        >
                          ACTION
                        </button>
                        {showModal[i] == true && (
                          <>
                            <ModalKosongan
                              isOpen={showModal[i]}
                              onClose={() => closeModalModal(i)}
                              judul={'Permohonan Izin'}
                            >
                              <>
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
                                        {data.karyawan?.name}
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
                                        {
                                          data.karyawan?.biodata_karyawan[0]
                                            ?.department?.nama_department
                                        }
                                      </label>
                                    </div>
                                    <div className="flex flex-col ">
                                      <label
                                        htmlFor=""
                                        className="text-black text-xs font-bold"
                                      >
                                        TANGGAL
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
                                        {data.karyawan_pengaju?.name}
                                      </label>
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2 ">
                                    <div className="flex flex-col ">
                                      <label
                                        htmlFor=""
                                        className="text-black text-xs font-bold"
                                      >
                                        LAMA KETIDAKHADIRAN
                                      </label>
                                      <label
                                        htmlFor=""
                                        className="text-[#016ae6] text-xl font-normal"
                                      >
                                        {data.jumlah_hari} HARI
                                      </label>
                                    </div>
                                    <div className="flex flex-col ">
                                      <label
                                        htmlFor=""
                                        className="text-black text-xs font-bold"
                                      >
                                        AWAL
                                      </label>
                                      <label
                                        htmlFor=""
                                        className="text-[#016ae6] text-xl font-normal"
                                      >
                                        {dateOnly(data.dari)}
                                      </label>
                                    </div>
                                    <div className="flex flex-col ">
                                      <label
                                        htmlFor=""
                                        className="text-black text-xs font-bold"
                                      >
                                        AKHIR
                                      </label>
                                      <label
                                        htmlFor=""
                                        className="text-[#016ae6] text-xl font-normal"
                                      >
                                        {dateOnly(data.sampai)}
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                {/* Lampiran / Surat Sakit Image */}
                                {data.lampiran && (
                                  <div className="px-4 py-2">
                                    <label className="text-black text-xs font-bold">
                                      SURAT SAKIT / LAMPIRAN
                                    </label>
                                    <div className="mt-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                                      <div className="flex items-center justify-center">
                                        <img
                                          src={`${
                                            import.meta.env.VITE_API_LINK
                                          }/images/${data.lampiran}`}
                                          alt="Surat Sakit"
                                          className="max-h-48 object-contain rounded border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() =>
                                            openFullscreen(
                                              `${
                                                import.meta.env.VITE_API_LINK
                                              }/images/${data.lampiran}`,
                                            )
                                          }
                                          onError={(e) => {
                                            e.currentTarget.style.display =
                                              'none';
                                          }}
                                        />
                                      </div>
                                      <p className="text-xs text-gray-500 mt-2 text-center">
                                        Klik gambar untuk memperbesar
                                      </p>
                                    </div>
                                  </div>
                                )}

                                <div className="flex flex-col w-full px-4 ">
                                  <label
                                    htmlFor=""
                                    className="text-black text-xs font-bold"
                                  >
                                    RESPON HR
                                    <span className="text-red-600">*</span>
                                  </label>
                                  <textarea
                                    onChange={(e) =>
                                      setcatatanHr(e.target.value)
                                    }
                                    className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                  ></textarea>
                                </div>
                                <div className="flex gap-2 w-full px-4 pt-1">
                                  <button
                                    disabled={isLoading}
                                    onClick={() => approveSakit(data.id, i)}
                                    className="bg-green-500 w-[50%] rounded-md px-3 py-3 text-white font-semibold text-sm"
                                  >
                                    TERIMA
                                  </button>
                                  {isLoading && <Loading />}
                                  <button
                                    disabled={isLoading}
                                    onClick={() => rejectSakit(data.id, i)}
                                    className="bg-red-500 w-[50%] rounded-md px-3 py-3 text-white font-semibold text-sm"
                                  >
                                    TOLAK
                                  </button>
                                  {isLoading && <Loading />}
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

export default IncomingSakitHR;
