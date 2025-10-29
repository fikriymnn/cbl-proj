import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_LINK;

interface KategoriKendala {
  id: number;
  kategori: string;
}

const MasterTableKategoriKendala: React.FC = () => {
  const [data, setData] = useState<KategoriKendala[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    kategori: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/master/produksi/kategoriKendala`,
      );
      setData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editMode && currentId) {
        await axios.put(
          `${API_BASE}/master/produksi/kategoriKendala/${currentId}`,
          formData,
        );
      } else {
        await axios.post(
          `${API_BASE}/master/produksi/kategoriKendala`,
          formData,
        );
      }
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: KategoriKendala) => {
    setEditMode(true);
    setCurrentId(item.id);
    setFormData({
      kategori: item.kategori,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentId(null);
    setFormData({
      kategori: '',
    });
  };

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-black dark:text-white">
              Kategori Kendala
            </h3>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-center font-medium text-white hover:bg-opacity-90"
            >
              <FaPlus />
              Tambah Data
            </button>
          </div>
        </div>

        <div className="p-7">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      No
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Kategori
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border-b border-[#eee] px-4 py-4 dark:border-strokedark">
                        {index + 1}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-4 dark:border-strokedark">
                        {item.kategori}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-4 dark:border-strokedark">
                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center justify-center gap-2 rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                        >
                          <FaEdit />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-boxdark">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-medium text-black dark:text-white">
                {editMode ? 'Edit' : 'Tambah'} Kategori Kendala
              </h3>
              <button
                onClick={resetForm}
                className="text-2xl hover:text-primary"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Kategori
                </label>
                <input
                  type="text"
                  value={formData.kategori}
                  onChange={(e) =>
                    setFormData({ ...formData, kategori: e.target.value })
                  }
                  placeholder="Masukkan kategori"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded border border-stroke px-5 py-2.5 hover:shadow-1 dark:border-strokedark"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded bg-primary px-5 py-2.5 text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MasterTableKategoriKendala;
