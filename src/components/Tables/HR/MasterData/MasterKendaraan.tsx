import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
import Loading from '../../../Loading';

interface Kendaraan {
  id: number;
  nomor_kendaraan: string;
  nama_kendaraan: string;
  is_active: boolean;
}

interface KendaraanResponse {
  data: Kendaraan[];
}

function MasterKendaraan() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [kendaraan, setKendaraan] = useState<KendaraanResponse | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean[]>([]);

  // Form states for add
  const [nomorKendaraan, setNomorKendaraan] = useState<string>('');
  const [namaKendaraan, setNamaKendaraan] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);

  // Form states for edit
  const [nomorKendaraanEdit, setNomorKendaraanEdit] = useState<string>('');
  const [namaKendaraanEdit, setNamaKendaraanEdit] = useState<string>('');
  const [isActiveEdit, setIsActiveEdit] = useState<boolean>(true);

  useEffect(() => {
    fetchKendaraan();
  }, []);

  const fetchKendaraan = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/master/kendaraan`;
    try {
      setIsLoading(true);
      const res = await axios.get<KendaraanResponse>(url, {
        withCredentials: true,
      });
      setKendaraan(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.error('Error fetching kendaraan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKendaraan = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const url = `${import.meta.env.VITE_API_LINK}/master/kendaraan`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          nomor_kendaraan: nomorKendaraan,
          nama_kendaraan: namaKendaraan,
          is_active: isActive,
        },
        {
          withCredentials: true,
        },
      );
      console.log('Kendaraan added:', res.data);
      setShowAddModal(false);
      resetAddForm();
      await fetchKendaraan();
    } catch (error: any) {
      console.error('Error adding kendaraan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditKendaraan = async (
    id: number,
    index: number,
  ): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/master/kendaraan/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {
          nomor_kendaraan: nomorKendaraanEdit,
          nama_kendaraan: namaKendaraanEdit,
          is_active: isActiveEdit,
        },
        {
          withCredentials: true,
        },
      );
      console.log('Kendaraan updated:', res.data);
      closeEditModal(index);
      resetEditForm();
      await fetchKendaraan();
    } catch (error: any) {
      console.error('Error updating kendaraan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKendaraan = async (
    id: number,
    index: number,
  ): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/master/kendaraan/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.delete(url, {
        withCredentials: true,
      });
      console.log('Kendaraan deleted:', res.data);
      closeDeleteModal(index);
      await fetchKendaraan();
    } catch (error: any) {
      console.error('Error deleting kendaraan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (i: number, data: Kendaraan): void => {
    const updatedModals = [...showEditModal];
    updatedModals[i] = true;
    setShowEditModal(updatedModals);
    setNomorKendaraanEdit(data.nomor_kendaraan);
    setNamaKendaraanEdit(data.nama_kendaraan);
    setIsActiveEdit(data.is_active);
  };

  const closeEditModal = (i: number): void => {
    const updatedModals = [...showEditModal];
    updatedModals[i] = false;
    setShowEditModal(updatedModals);
  };

  const openDeleteModal = (i: number): void => {
    const updatedModals = [...showDeleteModal];
    updatedModals[i] = true;
    setShowDeleteModal(updatedModals);
  };

  const closeDeleteModal = (i: number): void => {
    const updatedModals = [...showDeleteModal];
    updatedModals[i] = false;
    setShowDeleteModal(updatedModals);
  };

  const resetAddForm = (): void => {
    setNomorKendaraan('');
    setNamaKendaraan('');
    setIsActive(true);
  };

  const resetEditForm = (): void => {
    setNomorKendaraanEdit('');
    setNamaKendaraanEdit('');
    setIsActiveEdit(true);
  };

  return (
    <div className="p-4">
      <main className="overflow-x-auto">
        {isLoading && <Loading />}

        <div className="min-w-[800px] bg-white rounded-xl shadow-sm">
          {/* Header Section */}
          <div className="flex justify-between items-center px-6 py-4 border-b-2 border-[#D8EAFF]">
            <h1 className="text-xl font-bold text-gray-800"></h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 transition-colors rounded-md text-white text-sm font-semibold px-6 py-2.5 shadow-sm"
            >
              + Tambah Kendaraan
            </button>
          </div>

          {/* Add Modal */}
          {showAddModal && (
            <ModalKosonganSmall
              isOpen={showAddModal}
              onClose={() => {
                setShowAddModal(false);
                resetAddForm();
              }}
              judul="Tambah Kendaraan"
            >
              <div className="px-6 py-4">
                <form onSubmit={handleAddKendaraan} className="space-y-4">
                  <div className="flex flex-col">
                    <label className="text-gray-700 text-sm font-semibold mb-2">
                      Nomor Kendaraan <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={nomorKendaraan}
                      onChange={(e) => setNomorKendaraan(e.target.value)}
                      placeholder="Contoh: D 8948 ZU"
                      className="w-full h-11 px-3 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-gray-700 text-sm font-semibold mb-2">
                      Nama Kendaraan <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={namaKendaraan}
                      onChange={(e) => setNamaKendaraan(e.target.value)}
                      placeholder="Contoh: DOUBLE"
                      className="w-full h-11 px-3 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-gray-700 text-sm font-medium"
                    >
                      Status Aktif
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        resetAddForm();
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold px-6 py-2.5 rounded-md transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold px-6 py-2.5 rounded-md transition-colors"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </ModalKosonganSmall>
          )}

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b-2 border-[#D8EAFF]">
            <div className="col-span-1 text-gray-600 text-sm font-semibold">
              No
            </div>
            <div className="col-span-3 text-gray-600 text-sm font-semibold">
              Nomor Kendaraan
            </div>
            <div className="col-span-3 text-gray-600 text-sm font-semibold">
              Nama Kendaraan
            </div>
            <div className="col-span-2 text-gray-600 text-sm font-semibold">
              Status
            </div>
            <div className="col-span-3 text-gray-600 text-sm font-semibold text-center">
              Aksi
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {kendaraan?.data && kendaraan.data.length > 0 ? (
              kendaraan.data.map((data: Kendaraan, index: number) => (
                <div
                  key={data.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors"
                >
                  <div className="col-span-1 text-gray-700 text-sm">
                    {index + 1}
                  </div>
                  <div className="col-span-3 text-gray-700 text-sm font-medium">
                    {data.nomor_kendaraan}
                  </div>
                  <div className="col-span-3 text-gray-700 text-sm">
                    {data.nama_kendaraan}
                  </div>
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        data.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {data.is_active ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </div>
                  <div className="col-span-3 flex gap-2 justify-center">
                    <button
                      onClick={() => openEditModal(index, data)}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(index)}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors"
                    >
                      Hapus
                    </button>
                  </div>

                  {/* Edit Modal */}
                  {showEditModal[index] && (
                    <ModalKosonganSmall
                      isOpen={showEditModal[index]}
                      onClose={() => closeEditModal(index)}
                      judul="Edit Kendaraan"
                    >
                      <div className="px-6 py-4">
                        <div className="space-y-4">
                          <div className="flex flex-col">
                            <label className="text-gray-700 text-sm font-semibold mb-2">
                              Nomor Kendaraan{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              required
                              type="text"
                              value={nomorKendaraanEdit}
                              onChange={(e) =>
                                setNomorKendaraanEdit(e.target.value)
                              }
                              className="w-full h-11 px-3 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none transition-colors"
                            />
                          </div>

                          <div className="flex flex-col">
                            <label className="text-gray-700 text-sm font-semibold mb-2">
                              Nama Kendaraan{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              required
                              type="text"
                              value={namaKendaraanEdit}
                              onChange={(e) =>
                                setNamaKendaraanEdit(e.target.value)
                              }
                              className="w-full h-11 px-3 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none transition-colors"
                            />
                          </div>

                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id={`isActiveEdit-${index}`}
                              checked={isActiveEdit}
                              onChange={(e) =>
                                setIsActiveEdit(e.target.checked)
                              }
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label
                              htmlFor={`isActiveEdit-${index}`}
                              className="text-gray-700 text-sm font-medium"
                            >
                              Status Aktif
                            </label>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <button
                              type="button"
                              onClick={() => closeEditModal(index)}
                              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold px-6 py-2.5 rounded-md transition-colors"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleEditKendaraan(data.id, index)
                              }
                              disabled={isLoading}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold px-6 py-2.5 rounded-md transition-colors"
                            >
                              Simpan
                            </button>
                          </div>
                        </div>
                      </div>
                    </ModalKosonganSmall>
                  )}

                  {/* Delete Modal */}
                  {showDeleteModal[index] && (
                    <ModalKosonganSmall
                      isOpen={showDeleteModal[index]}
                      onClose={() => closeDeleteModal(index)}
                      judul="Konfirmasi Hapus"
                    >
                      <div className="px-6 py-4">
                        <div className="space-y-4">
                          <p className="text-gray-700 text-sm">
                            Apakah Anda yakin ingin menghapus kendaraan ini?
                          </p>
                          <div className="bg-gray-50 p-4 rounded-md space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600 text-sm font-medium">
                                Nomor Kendaraan:
                              </span>
                              <span className="text-gray-900 text-sm font-semibold">
                                {data.nomor_kendaraan}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 text-sm font-medium">
                                Nama Kendaraan:
                              </span>
                              <span className="text-gray-900 text-sm font-semibold">
                                {data.nama_kendaraan}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 text-sm font-medium">
                                Status:
                              </span>
                              <span
                                className={`text-sm font-semibold ${
                                  data.is_active
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {data.is_active ? 'Aktif' : 'Tidak Aktif'}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <button
                              type="button"
                              onClick={() => closeDeleteModal(index)}
                              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold px-6 py-2.5 rounded-md transition-colors"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteKendaraan(data.id, index)
                              }
                              disabled={isLoading}
                              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-semibold px-6 py-2.5 rounded-md transition-colors"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    </ModalKosonganSmall>
                  )}
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500 text-sm">
                  Tidak ada data kendaraan
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default MasterKendaraan;
