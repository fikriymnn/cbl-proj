import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { FaPlus, FaEdit } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_LINK;

interface KriteriaKendala {
  id: number;
  kriteria: string;
  value: number;
  tipe: string;
  bagian: string;
}

const MasterTableKriteriaKendala: React.FC = () => {
  const [data, setData] = useState<KriteriaKendala[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    kriteria: '',
    value: 0,
    tipe: 'Frekuensi',
    bagian: 'Produksi',
  });

  const tipeOptions = ['Frekuensi', 'Waktu', 'Qty'];
  const bagianOptions = ['Produksi', 'QC', 'Maintenance'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/master/produksi/kriteriaKendala`,
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
          `${API_BASE}/master/produksi/kriteriaKendala/${currentId}`,
          formData,
        );
      } else {
        await axios.post(
          `${API_BASE}/master/produksi/kriteriaKendala`,
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

  const handleEdit = (item: KriteriaKendala) => {
    setEditMode(true);
    setCurrentId(item.id);
    setFormData({
      kriteria: item.kriteria,
      value: item.value,
      tipe: item.tipe,
      bagian: item.bagian,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentId(null);
    setFormData({
      kriteria: '',
      value: 0,
      tipe: 'Frekuensi',
      bagian: 'Produksi',
    });
  };

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-black dark:text-white">
              Kriteria Kendala
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
                      Tipe
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Kriteria
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Value
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Bagian
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
                        {item.tipe}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-4 dark:border-strokedark">
                        {item.kriteria}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-4 dark:border-strokedark">
                        {item.value}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-4 dark:border-strokedark">
                        {item.bagian}
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
                {editMode ? 'Edit' : 'Tambah'} Kriteria Kendala
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
                  Tipe Kriteria
                </label>
                <select
                  value={formData.tipe}
                  onChange={(e) =>
                    setFormData({ ...formData, tipe: e.target.value })
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                  {tipeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Nama Kriteria
                </label>
                <input
                  type="text"
                  value={formData.kriteria}
                  onChange={(e) =>
                    setFormData({ ...formData, kriteria: e.target.value })
                  }
                  placeholder="Masukkan nama kriteria"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Kriteria Rule{' '}
                  <span className="text-meta-1">*Diisi Angka Saja</span>
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      value: parseInt(e.target.value),
                    })
                  }
                  placeholder="Masukkan value"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
                <div className="mt-2 text-sm text-meta-1">
                  <p>
                    Frekuensi = Berapa kali contoh: (5x)
                    <br />
                    Qty = Berapa persen contoh: (5%)
                    <br />
                    Waktu = Berapa jam contoh: (5jam)
                  </p>
                  <p className="mt-2">
                    Contoh Pengisian:
                    <br />
                    Criteria Type = Frekuensi
                    <br />
                    Criteria Name = Major
                    <br />
                    Criteria Rule = 5
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Bagian
                </label>
                <select
                  value={formData.bagian}
                  onChange={(e) =>
                    setFormData({ ...formData, bagian: e.target.value })
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                  {bagianOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded border border-stroke px-5 py-2.5 hover:shadow-1 dark:border-strokedark"
                >
                  Tutup
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

export default MasterTableKriteriaKendala;
