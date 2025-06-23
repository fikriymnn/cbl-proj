import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ModalAddPeriode from '../../../Modals/Qc/ModalAddPeriode';
import Loading from '../../../Loading';

interface MasterData {
  id: number;
  status?: string;
  lokasi?: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse {
  data: MasterData[];
  message?: string;
}

function MasterDataKalibrasiPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'lokasi'>('status');

  // Status Data
  const [masterStatus, setMasterStatus] = useState<ApiResponse | null>(null);
  const [statusValue, setStatusValue] = useState<string>('');

  // Lokasi Data
  const [masterLokasi, setMasterLokasi] = useState<ApiResponse | null>(null);
  const [lokasiValue, setLokasiValue] = useState<string>('');

  // Modal states
  const [showEdit, setShowEdit] = useState<boolean[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterData | null>(null);

  useEffect(() => {
    if (activeTab === 'status') {
      getStatusData();
    } else {
      getLokasiData();
    }
  }, [activeTab]);

  // Get Status Data
  async function getStatusData() {
    const url = `${import.meta.env.VITE_API_LINK}/master/qc/statusKalibrasi`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setMasterStatus(res.data);
      setShowEdit(new Array(res.data.data?.length || 0).fill(false));
      console.log('Status Data:', res.data);
    } catch (error: any) {
      console.log('Error fetching status:', error);
      alert(error.response?.data?.msg || 'Failed to fetch status data');
    } finally {
      setIsLoading(false);
    }
  }

  // Get Lokasi Data
  async function getLokasiData() {
    const url = `${import.meta.env.VITE_API_LINK}/master/qc/lokasiKalibrasi`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setMasterLokasi(res.data);
      setShowEdit(new Array(res.data.data?.length || 0).fill(false));
      console.log('Lokasi Data:', res.data);
    } catch (error: any) {
      console.log('Error fetching lokasi:', error);
      alert(error.response?.data?.msg || 'Failed to fetch lokasi data');
    } finally {
      setIsLoading(false);
    }
  }

  // Add Status
  async function addStatus() {
    const url = `${import.meta.env.VITE_API_LINK}/master/qc/statusKalibrasi`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        { status: statusValue },
        { withCredentials: true },
      );
      setShowAdd(false);
      setStatusValue('');
      getStatusData();
      alert('Status berhasil ditambahkan');
    } catch (error: any) {
      alert(error.response?.data?.msg || 'Failed to add status');
      console.log('Error adding status:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Add Lokasi
  async function addLokasi() {
    const url = `${import.meta.env.VITE_API_LINK}/master/qc/lokasiKalibrasi`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        { lokasi: lokasiValue },
        { withCredentials: true },
      );
      setShowAdd(false);
      setLokasiValue('');
      getLokasiData();
      alert('Lokasi berhasil ditambahkan');
    } catch (error: any) {
      alert(error.response?.data?.msg || 'Failed to add lokasi');
      console.log('Error adding lokasi:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Edit Status
  async function editStatus(id: number, index: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/qc/statusKalibrasi/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        { status: statusValue },
        { withCredentials: true },
      );
      closeEdit(index);
      getStatusData();
      setStatusValue('');
      alert('Status berhasil diupdate');
    } catch (error: any) {
      alert(error.response?.data?.msg || 'Failed to update status');
      console.log('Error updating status:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Edit Lokasi
  async function editLokasi(id: number, index: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/qc/lokasiKalibrasi/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        { lokasi: lokasiValue },
        { withCredentials: true },
      );
      closeEdit(index);
      getLokasiData();
      setLokasiValue('');
      alert('Lokasi berhasil diupdate');
    } catch (error: any) {
      alert(error.response?.data?.msg || 'Failed to update lokasi');
      console.log('Error updating lokasi:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Modal handlers
  const openEdit = (index: number, item: MasterData) => {
    const onchangeVal = [...showEdit];
    onchangeVal[index] = true;
    setShowEdit(onchangeVal);
    setEditingItem(item);

    if (activeTab === 'status') {
      setStatusValue(item.status || '');
    } else {
      setLokasiValue(item.lokasi || '');
    }
  };

  const closeEdit = (index: number) => {
    const onchangeVal = [...showEdit];
    onchangeVal[index] = false;
    setShowEdit(onchangeVal);
    setEditingItem(null);
    setStatusValue('');
    setLokasiValue('');
  };

  const openAdd = () => {
    setShowAdd(true);
    setStatusValue('');
    setLokasiValue('');
  };

  const closeAdd = () => {
    setShowAdd(false);
    setStatusValue('');
    setLokasiValue('');
  };

  const handleAdd = () => {
    if (activeTab === 'status') {
      if (!statusValue.trim()) {
        alert('Status tidak boleh kosong');
        return;
      }
      addStatus();
    } else {
      if (!lokasiValue.trim()) {
        alert('Lokasi tidak boleh kosong');
        return;
      }
      addLokasi();
    }
  };

  const handleEdit = (index: number) => {
    if (!editingItem) return;

    if (activeTab === 'status') {
      if (!statusValue.trim()) {
        alert('Status tidak boleh kosong');
        return;
      }
      editStatus(editingItem.id, index);
    } else {
      if (!lokasiValue.trim()) {
        alert('Lokasi tidak boleh kosong');
        return;
      }
      editLokasi(editingItem.id, index);
    }
  };

  const currentData = activeTab === 'status' ? masterStatus : masterLokasi;
  const fieldName = activeTab === 'status' ? 'Status' : 'Lokasi';

  return (
    <>
      {isLoading && <Loading />}

      {/* Tab Navigation */}
      <div className="flex bg-white rounded-md mb-4 overflow-hidden shadow-sm">
        <button
          onClick={() => setActiveTab('status')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'status'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Master Status Kalibrasi
        </button>
        <button
          onClick={() => setActiveTab('lokasi')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'lokasi'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Master Lokasi Kalibrasi
        </button>
      </div>

      {/* Add Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={openAdd}
          className="bg-green-600 hover:bg-green-700 rounded-md text-white text-sm font-bold px-6 py-2 transition-colors"
        >
          TAMBAH {fieldName.toUpperCase()}
        </button>
      </div>

      {/* Table Header */}
      <div className="flex bg-white py-3 w-full mt-2 mb-2 px-5 text-sm font-semibold rounded-md shadow-sm">
        <p className="w-16">No</p>
        <div className="grid grid-cols-12 w-full">
          <div className="col-span-6">{fieldName}</div>
          <div className="col-span-6 text-right">Aksi</div>
        </div>
      </div>

      {/* Table Content */}
      {currentData != null &&
        currentData?.data?.map((data: MasterData, i: number) => {
          const displayValue =
            activeTab === 'status' ? data.status : data.lokasi;

          return (
            <div
              key={data.id}
              className="flex bg-white py-3 w-full mb-1 px-5 text-sm font-medium border-b-2 border-[#D8EAFF] rounded-md shadow-sm"
            >
              <p className="w-16">{i + 1}</p>
              <div className="grid grid-cols-12 w-full">
                <div className="col-span-6 flex items-center">
                  {displayValue}
                </div>
                <div className="col-span-6 flex gap-2 justify-end">
                  <button
                    onClick={() => openEdit(i, data)}
                    className="bg-blue-600 hover:bg-blue-700 rounded-sm text-white text-xs font-bold px-4 py-1 transition-colors"
                  >
                    EDIT
                  </button>
                </div>
              </div>

              {/* Edit Modal */}
              {showEdit[i] && (
                <ModalAddPeriode
                  isOpen={showEdit[i]}
                  onClose={() => closeEdit(i)}
                  judul={`Edit ${fieldName}`}
                >
                  <div className="px-2 flex flex-col">
                    <label className="text-black text-sm font-bold pt-4">
                      {fieldName.toUpperCase()}
                    </label>
                    <input
                      defaultValue={displayValue}
                      onChange={(e) =>
                        activeTab === 'status'
                          ? setStatusValue(e.target.value)
                          : setLokasiValue(e.target.value)
                      }
                      type="text"
                      className="w-full h-10 self-stretch p-4 bg-white rounded-md border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder={`Masukkan ${fieldName.toLowerCase()}...`}
                    />

                    <div className="pt-4 flex gap-2">
                      <button
                        disabled={isLoading}
                        onClick={() => handleEdit(i)}
                        className="rounded-md justify-center items-center flex-1 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm transition-colors"
                      >
                        {isLoading ? 'Loading...' : 'SIMPAN'}
                      </button>
                      <button
                        onClick={() => closeEdit(i)}
                        className="rounded-md justify-center items-center flex-1 h-10 bg-gray-500 hover:bg-gray-600 text-white font-semibold text-sm transition-colors"
                      >
                        BATAL
                      </button>
                    </div>
                  </div>
                </ModalAddPeriode>
              )}
            </div>
          );
        })}

      {/* Add Modal */}
      {showAdd && (
        <ModalAddPeriode
          isOpen={showAdd}
          onClose={closeAdd}
          judul={`Tambah ${fieldName}`}
        >
          <div className="px-2 flex flex-col">
            <label className="text-black text-sm font-bold pt-4">
              {fieldName.toUpperCase()}
            </label>
            <input
              value={activeTab === 'status' ? statusValue : lokasiValue}
              onChange={(e) =>
                activeTab === 'status'
                  ? setStatusValue(e.target.value)
                  : setLokasiValue(e.target.value)
              }
              type="text"
              className="w-full h-10 self-stretch p-4 bg-white rounded-md border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder={`Masukkan ${fieldName.toLowerCase()}...`}
            />

            <div className="pt-4 flex gap-2">
              <button
                disabled={isLoading}
                onClick={handleAdd}
                className="rounded-md justify-center items-center flex-1 h-10 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-sm transition-colors"
              >
                {isLoading ? 'Loading...' : 'TAMBAH'}
              </button>
              <button
                onClick={closeAdd}
                className="rounded-md justify-center items-center flex-1 h-10 bg-gray-500 hover:bg-gray-600 text-white font-semibold text-sm transition-colors"
              >
                BATAL
              </button>
            </div>
          </div>
        </ModalAddPeriode>
      )}

      {/* Empty State */}
      {currentData?.data?.length === 0 && (
        <div className="flex justify-center items-center py-8 bg-white rounded-md">
          <p className="text-gray-500">
            Tidak ada data {fieldName.toLowerCase()}
          </p>
        </div>
      )}
    </>
  );
}

export default MasterDataKalibrasiPage;
