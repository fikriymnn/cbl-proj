import { useEffect, useState } from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import axios from 'axios';
import { Stack, Pagination } from '@mui/material';
import SearchableSelect from './SearchableSelect'; // Adjust path as needed

interface TahapanMesin {
  id?: number;
  id_tahapan: number;
  id_mesin_tahapan: number;
  shift: string;
}

interface Tahapan {
  id: number;
  kode_tahapan: string;
  nama_tahapan: string;
}

interface MesinTahapan {
  id: number;
  kode_mesin: string;
  nama_mesin: string;
}

type ModalType = 'tahapanMesin' | null;

function MasterTahapanMesin() {
  const [tahapanMesinList, setTahapanMesinList] = useState<TahapanMesin[]>([]);
  const [tahapanList, setTahapanList] = useState<Tahapan[]>([]);
  const [mesinTahapanList, setMesinTahapanList] = useState<MesinTahapan[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState({
    tahapanMesin: 1,
  });

  // Form states
  const [tahapanMesinForm, setTahapanMesinForm] = useState<
    Omit<TahapanMesin, 'id'>
  >({
    id_tahapan: 0,
    id_mesin_tahapan: 0,
    shift: '',
  });

  const [searches, setSearches] = useState({
    tahapanMesin: '',
  });

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTahapanMesinList();
  }, [page]);

  // Load tahapan and mesin tahapan data on mount
  useEffect(() => {
    getTahapanList();
    getMesinTahapanList();
  }, []);

  // Fetch tahapan mesin
  async function getTahapanMesinList() {
    const url = `${import.meta.env.VITE_API_LINK}/master/tahapanMesin`;
    try {
      setLoading(true);
      const res = await axios.get(url, {
        params: {
          page: page,
          limit: 15,
          search: searches.tahapanMesin || undefined,
        },
        withCredentials: true,
      });
      console.log('Fetched tahapan mesin:', res.data);
      setTahapanMesinList(res.data.data);
      setTotalPages((prev) => ({ ...prev, tahapanMesin: res.data.total_page }));
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  // Fetch tahapan list
  async function getTahapanList() {
    const url = `${import.meta.env.VITE_API_LINK}/master/tahapan`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      setTahapanList(res.data.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  // Fetch mesin tahapan list
  async function getMesinTahapanList() {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesinTahapan`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      setMesinTahapanList(res.data.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  const handleSearch = (type: keyof typeof searches) => {
    setPage(1);
    getTahapanMesinList();
  };

  const handleResetSearch = (type: keyof typeof searches) => {
    setSearches((prev) => ({ ...prev, [type]: '' }));
    setPage(1);
    getTahapanMesinList();
  };

  const openModal = (type: ModalType, item?: TahapanMesin) => {
    setActiveModal(type);
    if (item && item.id) {
      setEditingId(item.id);
      setTahapanMesinForm({
        id_tahapan: item.id_tahapan || 0,
        id_mesin_tahapan: item.id_mesin_tahapan || 0,
        shift: item.shift || '',
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
    setTahapanMesinForm({
      id_tahapan: 0,
      id_mesin_tahapan: 0,
      shift: '',
    });
  };

  async function createTahapanMesin(data: Omit<TahapanMesin, 'id'>) {
    const url = `${import.meta.env.VITE_API_LINK}/master/tahapanMesin`;
    try {
      setLoading(true);
      console.log('Creating tahapan mesin with data:', data);
      const res = await axios.post(url, data, {
        withCredentials: true,
      });

      getTahapanMesinList();
      closeModal();
      return res.data;
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function updateTahapanMesin(
    id: number,
    data: Omit<TahapanMesin, 'id'>,
  ) {
    const url = `${import.meta.env.VITE_API_LINK}/master/tahapanMesin/${id}`;
    try {
      setLoading(true);
      console.log('Updating tahapan mesin with data:', data);
      const res = await axios.put(url, data, { withCredentials: true });
      getTahapanMesinList();
      closeModal();
      return res.data;
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteTahapanMesin(id: number) {
    const url = `${import.meta.env.VITE_API_LINK}/master/tahapanMesin/${id}`;
    try {
      if (confirm('Are you sure you want to delete this tahapan mesin?')) {
        const res = await axios.delete(url, { withCredentials: true });
        getTahapanMesinList();
        return res.data;
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateTahapanMesin(editingId, tahapanMesinForm);
    } else {
      await createTahapanMesin(tahapanMesinForm);
    }
  };

  // Helper functions to get display names
  const getTahapanName = (id: number) => {
    const tahapan = tahapanList.find((t) => t.id === id);
    return tahapan
      ? `${tahapan.kode_tahapan} - ${tahapan.nama_tahapan}`
      : 'Unknown';
  };

  const getMesinName = (id: number) => {
    const mesin = mesinTahapanList.find((m) => m.id === id);
    return mesin
      ? `${mesin.kode_mesin || 'No Code'} - ${mesin.nama_mesin}`
      : 'Unknown';
  };

  return (
    <DefaultLayout>
      <div className="p-4">
        <p className="font-semibold md:text-[24px] text-[18px] text-primary mb-4">
          Master Data &gt; Tahapan Mesin
        </p>

        {/* Search and Add Button */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search tahapan mesin..."
              value={searches.tahapanMesin}
              onChange={(e) =>
                setSearches((prev) => ({
                  ...prev,
                  tahapanMesin: e.target.value,
                }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch('tahapanMesin');
                }
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <button
              onClick={() => handleSearch('tahapanMesin')}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={() => handleResetSearch('tahapanMesin')}
              disabled={loading}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
          <button
            onClick={() => openModal('tahapanMesin')}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Tahapan Mesin
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
                  Tahapan
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesin
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shift
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tahapanMesinList.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {(page - 1) * 15 + index + 1}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 max-w-[150px] truncate">
                    {getTahapanName(item.id_tahapan)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 max-w-[150px] truncate">
                    {getMesinName(item.id_mesin_tahapan)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {item.shift}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs font-medium space-x-1">
                    <button
                      onClick={() => openModal('tahapanMesin', item)}
                      className="text-blue-600 hover:text-blue-900 px-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTahapanMesin(item.id!)}
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
              count={totalPages.tahapanMesin}
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
        {activeModal === 'tahapanMesin' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? 'Edit Tahapan Mesin' : 'Add Tahapan Mesin'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tahapan
                    </label>
                    <SearchableSelect
                      options={[
                        { value: 0, label: 'Select Tahapan' },
                        ...tahapanList.map((tahapan) => ({
                          value: tahapan.id,
                          label: `${tahapan.kode_tahapan} - ${tahapan.nama_tahapan}`,
                        })),
                      ]}
                      value={tahapanMesinForm.id_tahapan}
                      onChange={(value) =>
                        setTahapanMesinForm((prev) => ({
                          ...prev,
                          id_tahapan: Number(value),
                        }))
                      }
                      placeholder="Select Tahapan"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mesin Tahapan
                    </label>
                    <SearchableSelect
                      options={[
                        { value: 0, label: 'Select Mesin Tahapan' },
                        ...mesinTahapanList.map((mesin) => ({
                          value: mesin.id,
                          label: `${mesin.kode_mesin || 'No Code'} - ${
                            mesin.nama_mesin
                          }`,
                        })),
                      ]}
                      value={tahapanMesinForm.id_mesin_tahapan}
                      onChange={(value) =>
                        setTahapanMesinForm((prev) => ({
                          ...prev,
                          id_mesin_tahapan: Number(value),
                        }))
                      }
                      placeholder="Select Mesin Tahapan"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Shift
                    </label>
                    <input
                      type="text"
                      value={tahapanMesinForm.shift}
                      onChange={(e) =>
                        setTahapanMesinForm((prev) => ({
                          ...prev,
                          shift: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                      placeholder="e.g., 1, 2"
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

export default MasterTahapanMesin;
