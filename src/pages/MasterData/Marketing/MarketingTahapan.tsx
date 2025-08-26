import { useEffect, useState } from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import axios from 'axios';
import { Stack, Pagination } from '@mui/material';

interface Tahapan {
  id?: number;
  kode_tahapan: string;
  nama_tahapan: string;
}

type ModalType = 'tahapan' | null;

function MasterTahapan() {
  const [tahapanList, setTahapanList] = useState<Tahapan[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState({
    tahapan: 1,
  });

  // Form states
  const [tahapanForm, setTahapanForm] = useState<Omit<Tahapan, 'id'>>({
    kode_tahapan: '',
    nama_tahapan: '',
  });

  const [searches, setSearches] = useState({
    tahapan: '',
  });

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTahapanList();
  }, [page]);

  // Fetch tahapan
  async function getTahapanList() {
    const url = `${import.meta.env.VITE_API_LINK}/master/tahapan`;
    try {
      setLoading(true);
      const res = await axios.get(url, {
        params: {
          page: page,
          limit: 15,
          search: searches.tahapan || undefined,
        },
        withCredentials: true,
      });
      console.log('Fetched tahapan:', res.data);
      setTahapanList(res.data.data);
      setTotalPages((prev) => ({ ...prev, tahapan: res.data.total_page }));
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (type: keyof typeof searches) => {
    setPage(1);
    getTahapanList();
  };

  const handleResetSearch = (type: keyof typeof searches) => {
    setSearches((prev) => ({ ...prev, [type]: '' }));
    setPage(1);
    getTahapanList();
  };

  const openModal = (type: ModalType, item?: Tahapan) => {
    setActiveModal(type);
    if (item && item.id) {
      setEditingId(item.id);
      setTahapanForm({
        kode_tahapan: item.kode_tahapan || '',
        nama_tahapan: item.nama_tahapan || '',
      });
    } else {
      setEditingId(null);
      resetForms();
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditingId(null);
    resetForms();
  };

  const resetForms = () => {
    setTahapanForm({
      kode_tahapan: '',
      nama_tahapan: '',
    });
  };

  async function createTahapan(data: Omit<Tahapan, 'id'>) {
    const url = `${import.meta.env.VITE_API_LINK}/master/tahapan`;
    try {
      setLoading(true);
      console.log('Creating tahapan with data:', data);
      const res = await axios.post(url, data, {
        withCredentials: true,
      });

      getTahapanList();
      closeModal();
      return res.data;
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function updateTahapan(id: number, data: Omit<Tahapan, 'id'>) {
    const url = `${import.meta.env.VITE_API_LINK}/master/tahapan/${id}`;
    try {
      setLoading(true);
      console.log('Updating tahapan with data:', data);
      const res = await axios.put(url, data, { withCredentials: true });
      getTahapanList();
      closeModal();
      return res.data;
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteTahapan(id: number) {
    const url = `${import.meta.env.VITE_API_LINK}/master/tahapan/${id}`;
    try {
      if (confirm('Are you sure you want to delete this tahapan?')) {
        const res = await axios.delete(url, { withCredentials: true });
        getTahapanList();
        return res.data;
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateTahapan(editingId, tahapanForm);
    } else {
      await createTahapan(tahapanForm);
    }
  };

  return (
    <DefaultLayout>
      <div className="p-4">
        <p className="font-semibold md:text-[24px] text-[18px] text-primary mb-4">
          Master Data &gt; Tahapan
        </p>

        {/* Search and Add Button */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search tahapan..."
              value={searches.tahapan}
              onChange={(e) =>
                setSearches((prev) => ({ ...prev, tahapan: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch('tahapan');
                }
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <button
              onClick={() => handleSearch('tahapan')}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={() => handleResetSearch('tahapan')}
              disabled={loading}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
          <button
            onClick={() => openModal('tahapan')}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Tahapan
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full table-auto text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kode Tahapan
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Tahapan
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tahapanList.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {(page - 1) * 15 + index + 1}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {item.kode_tahapan}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {item.nama_tahapan}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs font-medium space-x-1">
                    <button
                      onClick={() => openModal('tahapan', item)}
                      className="text-blue-600 hover:text-blue-900 px-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTahapan(item.id!)}
                      className="text-red-600 hover:text-red-900 px-1"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="w-full flex justify-center mt-3 pb-2">
          <Stack spacing={2}>
            <Pagination
              count={totalPages.tahapan}
              page={page}
              color="primary"
              size="small"
              onChange={(e, i) => {
                setPage(i);
              }}
            />
          </Stack>
        </div>

        {/* Modal */}
        {activeModal === 'tahapan' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? 'Edit Tahapan' : 'Add Tahapan'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kode Tahapan
                    </label>
                    <input
                      type="text"
                      value={tahapanForm.kode_tahapan}
                      onChange={(e) =>
                        setTahapanForm((prev) => ({
                          ...prev,
                          kode_tahapan: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nama Tahapan
                    </label>
                    <input
                      type="text"
                      value={tahapanForm.nama_tahapan}
                      onChange={(e) =>
                        setTahapanForm((prev) => ({
                          ...prev,
                          nama_tahapan: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
                  >
                    {loading ? 'Saving...' : editingId ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}

export default MasterTahapan;
