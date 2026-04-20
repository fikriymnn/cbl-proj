import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import Loading from '../../../components/Loading';

function Pm1() {
  const [isMobile, setIsMobile] = useState(false);
  const kosong: any = [];
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const date = today.getDate();
  const currentDate = month + '/' + date + '/' + year;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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

  const [showModal4, setShowModal4] = useState(false);
  const openModal4 = () => setShowModal4(true);

  // --- No Checking Modal State ---
  const [showNoCheckModal, setShowNoCheckModal] = useState(false);
  const [selectedId, setSelectedId] = useState<any>(null);
  const [noCheckNote, setNoCheckNote] = useState('');

  const openNoCheckModal = (id: any) => {
    setSelectedId(id);
    setNoCheckNote('');
    setShowNoCheckModal(true);
  };

  const closeNoCheckModal = () => {
    setShowNoCheckModal(false);
    setSelectedId(null);
    setNoCheckNote('');
  };

  const [pm1, setPm1] = useState<any>();

  useEffect(() => {
    getPM1();
    getMe();
  }, []);

  async function getPM1() {
    const url = `${import.meta.env.VITE_API_LINK}/pm1`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          tgl: currentDate,
        },
        withCredentials: true,
      });
      setIsLoading(false);
      setPm1(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error.data?.msg);
    }
  }

  const [me, setMe] = useState<any>();

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      setMe(res.data);
    } catch (error: any) {
      console.log(error.data?.msg);
    }
  }

  async function inspectPM1(id: any) {
    const url = `${import.meta.env.VITE_API_LINK}/pm1/response/${id}`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      navigate(`/maintenance/preventive/pm1/form/${id}`);
    } catch (error: any) {
      console.log(error);
    }
  }

  async function noCheckingPM1() {
    if (!selectedId) return;
    const url = `${import.meta.env.VITE_API_LINK}/pm1/noChecking/${selectedId}`;
    try {
      setIsLoading(true);
      await axios.put(url, { note: noCheckNote }, { withCredentials: true });
      setIsLoading(false);
      closeNoCheckModal();
      getPM1();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function createPM1() {
    const url = `${import.meta.env.VITE_API_LINK}/pm1/create`;
    try {
      setIsLoading(true);
      await axios.post(url, {}, { withCredentials: true });
      setIsLoading(false);
      getPM1();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  function convertDatetimeToDate(datetime: any) {
    const dateObject = new Date(datetime);
    const day = dateObject.getDate().toString().padStart(2, '0');
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObject.getFullYear();
    return `${year}/${month}/${day} `;
  }

  // Static lookup so Tailwind doesn't purge dynamic color classes
  const bagianColor: Record<string, string> = {
    printing: 'bg-green-600',
    'water base': 'bg-yellow-600',
    pond: 'bg-violet-900',
    finishing: 'bg-red-900',
  };

  // Status badge color helper
  function getStatusBadge(status: string) {
    const base = 'px-2 py-[2px] rounded text-[11px] font-bold uppercase';
    if (status === 'done') return `${base} bg-green-100 text-green-700`;
    if (status === 'on progres') return `${base} bg-yellow-100 text-yellow-700`;
    if (status === 'no checking') return `${base} bg-red-100 text-red-700`;
    return `${base} bg-gray-100 text-gray-500`;
  }

  const tanggal = convertDatetimeToDate(new Date());

  // Reusable action buttons block
  const renderActions = (data: any) => (
    <div className="flex gap-2 flex-wrap">
      {(data.id_inspector == me?.id || data.id_inspector == null) &&
        data.status !== 'no checking' && (
          <>
            {data.status === 'done' || data.status === 'on progres' ? (
              <Link
                to={`/maintenance/preventive/pm1/form/${data.id}`}
                className="uppercase inline-flex rounded-[3px] items-center text-sm px-3 py-1 my-2 hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center"
              >
                INSPECT
              </Link>
            ) : (
              <button
                onClick={() => inspectPM1(data.id)}
                className="uppercase inline-flex rounded-[3px] items-center text-sm px-3 py-1 my-2 hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center"
              >
                INSPECT
              </button>
            )}
            {!data.status || data.status === 'incoming' ? (
              <button
                onClick={() => openNoCheckModal(data.id)}
                className="uppercase inline-flex rounded-[3px] items-center text-sm px-3 py-1 my-2 hover:bg-orange-400 border bg-orange-500 border-orange-500 text-white font-bold text-[12px] justify-center"
              >
                TANPA INSPECT
              </button>
            ) : null}
          </>
        )}
    </div>
  );

  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Maintenance &gt; Inspection &gt; PM 1
      </p>
      {isLoading && <Loading />}

      {/* ---- No Checking Modal ---- */}
      {showNoCheckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-md p-6">
            <h2 className="text-[18px] font-bold text-gray-800 mb-1">
              Tanpa Inspect
            </h2>
            <p className="text-[13px] text-gray-500 mb-4">
              Masukkan catatan alasan tidak ada pengecekan.
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
              rows={4}
              placeholder="Contoh: tidak ada pengecekan karena mati"
              value={noCheckNote}
              onChange={(e) => setNoCheckNote(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={closeNoCheckModal}
                className="px-4 py-2 rounded-[3px] border border-gray-300 text-gray-600 text-[13px] font-semibold hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={noCheckingPM1}
                disabled={!noCheckNote.trim()}
                className="px-4 py-2 rounded-[3px] bg-orange-500 text-white text-[13px] font-bold hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Desktop View ---- */}
      {!isMobile && (
        <main className="overflow-x-scroll">
          <div className="min-w-[700px] bg-white rounded-xl">
            <p className="text-[14px] font-semibold w-full border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12">
              {tanggal}
            </p>
            {pm1?.length <= 0 ? (
              <button
                onClick={createPM1}
                className="uppercase p-5 inline-flex rounded-[3px] items-center text-sm py-1 my-2 hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center"
              >
                TAMBAH PM1
              </button>
            ) : null}

            {/* Header */}
            <div className="ps-7 w-full h-full flex border-b-8 border-[#D8EAFF]">
              <div className="w-2 h-full"></div>
              <section className="grid grid-cols-5 w-full py-4 font-semibold text-[14px]">
                <p>Nama Mesin</p>
                <p>Inspector</p>
                <p>Status</p>
                <p>Catatan</p>
                <div className="w-[125px]">{''}</div>
              </section>
            </div>

            {/* Rows */}
            {pm1 != null &&
              pm1.map((data: any, i: any) => (
                <section
                  key={i}
                  className="flex items-stretch justify-center w-full min-h-[59px] border-b-8 border-[#D8EAFF] text-[14px] text-black"
                >
                  <div
                    className={`w-2 self-stretch sticky left-0 z-20 ${
                      bagianColor[data.mesin.bagian_mesin] ?? ''
                    }`}
                  ></div>

                  <div className="w-full h-full flex flex-col justify-center relative">
                    <div className="ps-7 w-full grid grid-cols-5 py-2">
                      <div className="flex flex-col justify-center font-bold sticky left-2 ps-3 md:ps-0 bg-white">
                        <p>{data.mesin.nama_mesin}</p>
                      </div>
                      <div className="flex flex-col justify-center">
                        <p>
                          {data.inspector != null ? data.inspector.nama : '-'}
                        </p>
                      </div>
                      <div className="flex flex-col justify-center">
                        {data.status ? (
                          <span className={getStatusBadge(data.status)}>
                            {data.status}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[12px]">-</span>
                        )}
                      </div>
                      <div className="flex flex-col justify-center pr-2">
                        <p className="text-[12px] text-gray-600 break-words">
                          {data.catatan ?? data.note ?? '-'}
                        </p>
                      </div>
                      <div className="flex flex-col justify-center">
                        {renderActions(data)}
                      </div>
                    </div>
                  </div>
                </section>
              ))}
          </div>
        </main>
      )}

      {/* ---- Mobile View ---- */}
      {isMobile && (
        <main className="overflow-x-scroll">
          <div className="w-full bg-white rounded-xl">
            <p className="text-[14px] font-semibold w-full border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12">
              {tanggal}
            </p>
            {pm1?.length <= 0 ? (
              <button
                onClick={createPM1}
                className="uppercase p-5 inline-flex rounded-[3px] items-center text-sm py-1 my-2 hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center"
              >
                TAMBAH PM1
              </button>
            ) : null}

            {/* Header */}
            <div className="ps-7 w-full h-full flex border-b-8 border-[#D8EAFF]">
              <div className="w-2 h-full"></div>
              <section className="grid grid-cols-4 w-full py-4 font-semibold text-[13px]">
                <p>Nama Mesin</p>
                <p>Inspektor</p>
                <p>Status</p>
                <p>Aksi</p>
              </section>
            </div>

            {/* Rows */}
            {pm1 != null &&
              pm1.map((data: any, i: any) => (
                <section
                  key={i}
                  className="flex items-stretch justify-center w-full min-h-[59px] border-b-8 border-[#D8EAFF] text-[13px] text-black"
                >
                  <div
                    className={`w-2 self-stretch sticky left-0 z-20 ${
                      bagianColor[data.mesin.bagian_mesin] ?? ''
                    }`}
                  ></div>
                  <div className="w-full h-full flex flex-col justify-center relative">
                    <div className="ps-4 w-full grid grid-cols-4 py-2 gap-1">
                      <div className="flex flex-col justify-center font-bold">
                        <p>{data.mesin?.nama_mesin ?? data.nama_mesin}</p>
                      </div>
                      <div className="flex flex-col justify-center">
                        <p>
                          {data.inspector != null ? data.inspector.nama : '-'}
                        </p>
                      </div>
                      <div className="flex flex-col justify-center">
                        {data.status ? (
                          <span className={getStatusBadge(data.status)}>
                            {data.status}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[12px]">-</span>
                        )}
                        {(data.catatan ?? data.note) && (
                          <p className="text-[11px] text-gray-500 mt-1 break-words">
                            {data.catatan ?? data.note}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                        {renderActions(data)}
                      </div>
                    </div>
                  </div>
                </section>
              ))}
          </div>
        </main>
      )}
    </DefaultLayout>
  );
}

export default Pm1;
