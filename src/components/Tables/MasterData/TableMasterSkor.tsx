import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SkorData {
  id: number;
  nama_skor: string;
  skor: number;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  nama_skor: string;
  skor: number;
}

const TableMasterSkor: React.FC = () => {
  const [skorPerbaikan, setSkorPerbaikan] = useState<SkorData[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nama_skor: '',
    skor: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSkorPerbaikan();
  }, []);

  async function getSkorPerbaikan() {
    const url = `${import.meta.env.VITE_API_LINK}/master/skorMtc`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setSkorPerbaikan(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data?.msg);
    }
  }

  const handleEdit = (item: SkorData) => {
    setIsEditing(item.id);
    setFormData({
      nama_skor: item.nama_skor,
      skor: item.skor,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setFormData({ nama_skor: '', skor: 0 });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({ nama_skor: '', skor: 0 });
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setFormData({ nama_skor: '', skor: 0 });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'skor' ? Number(value) : value,
    });
  };

  const handleUpdate = async (id: number) => {
    const url = `${import.meta.env.VITE_API_LINK}/master/skorMtc/${id}`;
    setLoading(true);
    console.log(formData);
    try {
      await axios.put(url, formData, {
        withCredentials: true,
      });
      alert('Data berhasil diupdate!');
      setIsEditing(null);
      setFormData({ nama_skor: '', skor: 0 });
      getSkorPerbaikan();
    } catch (error: any) {
      console.log(error);
      alert('Gagal mengupdate data!');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCreate = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/master/skorMtc`;
    setLoading(true);
    try {
      await axios.post(url, formData, {
        withCredentials: true,
      });
      alert('Data berhasil dibuat!');
      setIsCreating(false);
      setFormData({ nama_skor: '', skor: 0 });
      getSkorPerbaikan();
    } catch (error: any) {
      console.log(error.response?.data?.msg);
      alert('Gagal membuat data!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleCreate}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Tambah Data
        </button>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Tambah Data Baru</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Nama Skor:</label>
                <input
                  type="text"
                  name="nama_skor"
                  value={formData.nama_skor}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Masukkan nama skor"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Skor:</label>
                <input
                  type="number"
                  name="skor"
                  value={formData.skor}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Masukkan nilai skor"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSubmitCreate}
                disabled={loading}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 flex-1"
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                onClick={handleCancelCreate}
                disabled={loading}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 flex-1"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Data</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Nama Skor:</label>
                <input
                  type="text"
                  name="nama_skor"
                  value={formData.nama_skor}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Masukkan nama skor"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Skor:</label>
                <input
                  type="number"
                  name="skor"
                  value={formData.skor}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Masukkan nilai skor"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => handleUpdate(isEditing)}
                disabled={loading}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 flex-1"
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 flex-1"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Nama Skor</th>
              <th className="py-2 px-4 border-b">Skor</th>
              <th className="py-2 px-4 border-b">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {skorPerbaikan.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b text-center">{item.id}</td>
                <td className="py-2 px-4 border-b text-center">
                  {item.nama_skor}
                </td>
                <td className="py-2 px-4 border-b text-center">{item.skor}</td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableMasterSkor;
