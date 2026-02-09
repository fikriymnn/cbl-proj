import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
import Loading from '../../../Loading';

function MasterIzinTerlambatHRD() {
  const [isLoading, setIsLoading] = useState(false);
  const [masterTerlambat, setMasterTerlambat] = useState<any>();

  // Add modal state
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<any>([]);
  const [showDelete, setShowDelete] = useState<any>([]);

  // Form states
  const [alasanTerlambat, setAlasanTerlambat] = useState('');
  const [jumlahJam, setJumlahJam] = useState('');
  const [alasanTerlambatEdit, setAlasanTerlambatEdit] = useState('');
  const [jumlahJamEdit, setJumlahJamEdit] = useState('');

  useEffect(() => {
    getMasterTerlambat();
  }, []);

  const getMasterTerlambat = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/terlambat`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setMasterTerlambat(res.data);
    } catch (error: any) {
      console.error('Error fetching master terlambat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAddForm = () => {
    setAlasanTerlambat('');
    setJumlahJam('');
  };

  const postMasterTerlambat = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/terlambat`;
    try {
      setIsLoading(true);
      await axios.post(
        url,
        {
          alasan_terlambat: alasanTerlambat,
          jumlah_jam: Number(jumlahJam),
        },
        {
          withCredentials: true,
        },
      );
      resetAddForm();
      closeModalAdd();
      await getMasterTerlambat();
    } catch (error: any) {
      console.error('Error creating master terlambat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const editMasterTerlambat = async (id: number, index: number) => {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/terlambat/${id}`;
    try {
      setIsLoading(true);
      await axios.put(
        url,
        {
          alasan_terlambat: alasanTerlambatEdit,
          jumlah_jam: Number(jumlahJamEdit),
        },
        {
          withCredentials: true,
        },
      );
      closeEdit(index);
      await getMasterTerlambat();
    } catch (error: any) {
      console.error('Error updating master terlambat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMasterTerlambat = async (id: number, index: number) => {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/terlambat/${id}`;
    try {
      setIsLoading(true);
      await axios.delete(url, {
        withCredentials: true,
      });
      closeDelete(index);
      await getMasterTerlambat();
    } catch (error: any) {
      console.error('Error deleting master terlambat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Modal handlers
  const openModalAdd = () => setShowAdd(true);
  const closeModalAdd = () => {
    setShowAdd(false);
    resetAddForm();
  };

  const openEdit = (i: number, data: any) => {
    const onchangeVal: any = [...showEdit];
    onchangeVal[i] = true;
    setShowEdit(onchangeVal);
    setAlasanTerlambatEdit(data.alasan_terlambat);
    setJumlahJamEdit(data.jumlah_jam);
  };

  const closeEdit = (i: number) => {
    const onchangeVal: any = [...showEdit];
    onchangeVal[i] = false;
    setShowEdit(onchangeVal);
    setAlasanTerlambatEdit('');
    setJumlahJamEdit('');
  };

  const openDelete = (i: number) => {
    const onchangeVal: any = [...showDelete];
    onchangeVal[i] = true;
    setShowDelete(onchangeVal);
  };

  const closeDelete = (i: number) => {
    const onchangeVal: any = [...showDelete];
    onchangeVal[i] = false;
    setShowDelete(onchangeVal);
  };

  return (
    <div className="w-full">
      {isLoading && <Loading />}

      <main className="overflow-x-auto">
        <div className="min-w-[700px] bg-white rounded-xl shadow-sm">
          {/* Header with Add Button */}
          <div className="flex justify-end items-center px-8 py-4 border-b-8 border-[#D8EAFF]">
            <button
              onClick={openModalAdd}
              className="bg-blue-600 hover:bg-blue-700 transition-colors rounded-sm text-white text-xs font-bold px-4 py-2"
            >
              TAMBAH IZIN TERLAMBAT
            </button>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-11 gap-4 px-3 py-4 border-b-8 border-[#D8EAFF]">
            <label className="text-neutral-500 text-xs font-semibold">No</label>
            <label className="text-neutral-500 text-xs font-semibold col-span-4">
              Alasan Terlambat
            </label>
            <label className="text-neutral-500 text-xs font-semibold col-span-2">
              Jumlah Jam
            </label>
            <label className="text-neutral-500 text-xs font-semibold col-span-4 text-center">
              Aksi
            </label>
          </div>

          {/* Table Body */}
          <div className="divide-y-8 divide-[#D8EAFF]">
            {masterTerlambat?.data?.length > 0 ? (
              masterTerlambat.data.map((data: any, i: number) => (
                <div
                  key={data.id}
                  className="grid grid-cols-11 gap-4 px-3 items-center py-3"
                >
                  <span className="text-neutral-700 text-xs font-medium">
                    {i + 1}
                  </span>
                  <span className="text-neutral-700 text-xs font-medium col-span-4">
                    {data.alasan_terlambat}
                  </span>
                  <span className="text-neutral-700 text-xs font-medium col-span-2">
                    {data.jumlah_jam} jam
                  </span>
                  <div className="col-span-4 flex gap-2 justify-center">
                    <button
                      onClick={() => openEdit(i, data)}
                      className="bg-blue-600 hover:bg-blue-700 transition-colors rounded-sm text-white text-xs font-bold px-4 py-1"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => openDelete(i)}
                      className="bg-red-600 hover:bg-red-700 transition-colors rounded-sm text-white text-xs font-bold px-4 py-1"
                    >
                      DELETE
                    </button>
                  </div>

                  {/* Edit Modal */}
                  {showEdit[i] && (
                    <ModalKosonganSmall
                      isOpen={showEdit[i]}
                      onClose={() => closeEdit(i)}
                      judul="Edit Izin Terlambat"
                    >
                      <div className="px-5 py-4">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            editMasterTerlambat(data.id, i);
                          }}
                        >
                          <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-black text-xs font-bold">
                                Alasan Terlambat
                              </label>
                              <input
                                required
                                value={alasanTerlambatEdit}
                                onChange={(e) =>
                                  setAlasanTerlambatEdit(e.target.value)
                                }
                                type="text"
                                className="w-full h-10 px-3 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                                placeholder="Masukkan alasan terlambat"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-black text-xs font-bold">
                                Jumlah Jam
                              </label>
                              <input
                                required
                                value={jumlahJamEdit}
                                onChange={(e) =>
                                  setJumlahJamEdit(e.target.value)
                                }
                                type="number"
                                min="0"
                                step="0.5"
                                className="w-full h-10 px-3 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                                placeholder="Masukkan jumlah jam"
                              />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-[#0065DE] hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-white text-xs font-bold px-6 py-3 rounded-md"
                              >
                                SIMPAN
                              </button>
                              <button
                                type="button"
                                onClick={() => closeEdit(i)}
                                className="bg-gray-300 hover:bg-gray-400 transition-colors text-gray-700 text-xs font-bold px-6 py-3 rounded-md"
                              >
                                BATAL
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </ModalKosonganSmall>
                  )}

                  {/* Delete Modal */}
                  {showDelete[i] && (
                    <ModalKosonganSmall
                      isOpen={showDelete[i]}
                      onClose={() => closeDelete(i)}
                      judul="Hapus Izin Terlambat"
                    >
                      <div className="px-5 py-4">
                        <div className="space-y-4">
                          <p className="text-gray-700 text-sm">
                            Apakah Anda yakin ingin menghapus data berikut?
                          </p>
                          <div className="bg-gray-50 p-4 rounded-md space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600 text-sm font-medium">
                                Alasan Terlambat:
                              </span>
                              <span className="text-gray-900 text-sm font-bold">
                                {data.alasan_terlambat}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 text-sm font-medium">
                                Jumlah Jam:
                              </span>
                              <span className="text-gray-900 text-sm font-bold">
                                {data.jumlah_jam} jam
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              disabled={isLoading}
                              onClick={() => deleteMasterTerlambat(data.id, i)}
                              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 transition-colors text-white text-xs font-bold px-6 py-3 rounded-md w-full"
                            >
                              YA, HAPUS
                            </button>
                            <button
                              onClick={() => closeDelete(i)}
                              className="bg-gray-300 hover:bg-gray-400 transition-colors text-gray-700 text-xs font-bold px-6 py-3 rounded-md w-full"
                            >
                              BATAL
                            </button>
                          </div>
                        </div>
                      </div>
                    </ModalKosonganSmall>
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500 text-sm">
                Tidak ada data izin terlambat
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Modal */}
      {showAdd && (
        <ModalKosonganSmall
          isOpen={showAdd}
          onClose={closeModalAdd}
          judul="Tambah Izin Terlambat"
        >
          <div className="px-5 py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                postMasterTerlambat();
              }}
            >
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-black text-xs font-bold">
                    Alasan Terlambat
                  </label>
                  <input
                    required
                    value={alasanTerlambat}
                    onChange={(e) => setAlasanTerlambat(e.target.value)}
                    type="text"
                    className="w-full h-10 px-3 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Masukkan alasan terlambat"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-black text-xs font-bold">
                    Jumlah Jam
                  </label>
                  <input
                    required
                    value={jumlahJam}
                    onChange={(e) => setJumlahJam(e.target.value)}
                    type="number"
                    min="0"
                    step="0.5"
                    className="w-full h-10 px-3 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Masukkan jumlah jam"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#0065DE] hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-white text-xs font-bold px-6 py-3 rounded-md"
                  >
                    SIMPAN
                  </button>
                  <button
                    type="button"
                    onClick={closeModalAdd}
                    className="bg-gray-300 hover:bg-gray-400 transition-colors text-gray-700 text-xs font-bold px-6 py-3 rounded-md"
                  >
                    BATAL
                  </button>
                </div>
              </div>
            </form>
          </div>
        </ModalKosonganSmall>
      )}
    </div>
  );
}

export default MasterIzinTerlambatHRD;
