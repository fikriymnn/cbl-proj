import { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../../Loading';

function MasterKapasitas() {
  const [isLoading, setIsLoading] = useState(false);
  const [kapasitasData, setKapasitasData] = useState([]);
  const [mesinMaster, setMesinMaster] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    nama_mesin: '',
    kapasitas: 0,
  });

  useEffect(() => {
    getMasterKapasitas();
    getMasterMesin();
  }, []);

  async function getMasterKapasitas() {
    const url = `${import.meta.env.VITE_API_LINK}/master/ppic/kapasitasMesin`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setKapasitasData(res.data.data || []);
      setIsLoading(false);
      console.log(res.data);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function getMasterMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesinTahapan`;
    try {
      const res = await axios.get(url, {});
      setMesinMaster(res.data.data || []);
      console.log('mesin list', res.data.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function addKapasitas() {
    const url = `${import.meta.env.VITE_API_LINK}/master/ppic/kapasitasMesin`;
    try {
      setIsLoading(true);
      await axios.post(
        url,
        {
          nama_mesin: formData.nama_mesin,
          kapasitas: parseInt(formData.kapasitas),
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      setShowAddModal(false);
      setFormData({ nama_mesin: '', kapasitas: 0 });
      getMasterKapasitas();
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      alert('Failed to add data');
    }
  }

  async function updateKapasitas() {
    if (!editingItem) return;

    const url = `${import.meta.env.VITE_API_LINK}/master/ppic/kapasitasMesin/${
      editingItem.id
    }`;
    try {
      setIsLoading(true);
      await axios.put(
        url,
        {
          nama_mesin: formData.nama_mesin,
          kapasitas: parseInt(formData.kapasitas),
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      setShowEditModal(false);
      setEditingItem(null);
      setFormData({ nama_mesin: '', kapasitas: 0 });
      getMasterKapasitas();
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      alert('Failed to update data');
    }
  }

  function handleOpenEdit(item: any) {
    setEditingItem(item);
    setFormData({
      nama_mesin: item.nama_mesin,
      kapasitas: item.kapasitas,
    });
    setShowEditModal(true);
  }

  function handleCloseModal() {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingItem(null);
    setFormData({ nama_mesin: '', kapasitas: 0 });
  }

  function formatNumber(number: any) {
    return new Intl.NumberFormat('id-ID').format(number);
  }

  return (
    <main className="overflow-x-auto">
      {isLoading && <Loading />}
      <div className="min-w-[700px] bg-white rounded-xl flex flex-col gap-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Master Kapasitas Mesin</h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={() => setShowAddModal(true)}
          >
            Tambah Data
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Mesin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kapasitas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kapasitasData.length > 0 ? (
                kapasitasData.map((item: any, index: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.nama_mesin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(item.kapasitas)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.updatedAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 px-3 py-1 rounded-md"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Tambah Data Kapasitas</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="nama_mesin"
              >
                Nama Mesin
              </label>
              <select
                id="nama_mesin"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.nama_mesin}
                onChange={(e) =>
                  setFormData({ ...formData, nama_mesin: e.target.value })
                }
                required
              >
                <option value="">Pilih Mesin</option>
                {mesinMaster.map((mesin: any) => (
                  <option key={mesin.id} value={mesin.nama_mesin || mesin.name}>
                    {mesin.nama_mesin || mesin.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="kapasitas"
              >
                Kapasitas
              </label>
              <input
                type="number"
                id="kapasitas"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.kapasitas}
                onChange={(e) =>
                  setFormData({ ...formData, kapasitas: e.target.value })
                }
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={addKapasitas}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Kapasitas Mesin</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="edit_nama_mesin"
              >
                Nama Mesin
              </label>
              <select
                id="edit_nama_mesin"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.nama_mesin}
                onChange={(e) =>
                  setFormData({ ...formData, nama_mesin: e.target.value })
                }
                required
              >
                <option value="">Pilih Mesin</option>
                {mesinMaster.map((mesin: any) => (
                  <option key={mesin.mesin} value={mesin.mesin || mesin.name}>
                    {mesin.mesin || mesin.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="edit_kapasitas"
              >
                Kapasitas
              </label>
              <input
                type="number"
                id="edit_kapasitas"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.kapasitas}
                onChange={(e) =>
                  setFormData({ ...formData, kapasitas: e.target.value })
                }
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={updateKapasitas}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default MasterKapasitas;
