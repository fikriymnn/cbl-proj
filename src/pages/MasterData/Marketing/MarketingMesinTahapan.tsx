import { useEffect, useState } from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import axios from 'axios';
import { Stack, Pagination } from '@mui/material';

interface MesinTahapan {
  id?: number;
  kode_mesin?: string;
  nama_mesin: string;
}

type ModalType = 'mesinTahapan' | null;

function MasterMesinTahapan() {
  const [mesinTahapanList, setMesinTahapanList] = useState<MesinTahapan[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState({
    mesinTahapan: 1,
  });

  // Form states
  const [mesinTahapanForm, setMesinTahapanForm] = useState<
    Omit<MesinTahapan, 'id'>
  >({
    kode_mesin: '',
    nama_mesin: '',
  });

  const [searches, setSearches] = useState({
    mesinTahapan: '',
  });

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMesinTahapanList();
  }, [page]);

  // Fetch mesin tahapan
  async function getMesinTahapanList() {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesinTahapan`;
    try {
      setLoading(true);
      const res = await axios.get(url, {
        params: {
          page: page,
          limit: 15,
          search: searches.mesinTahapan || undefined,
        },
        withCredentials: true,
      });
      console.log('Fetched mesin tahapan:', res.data);
      setMesinTahapanList(res.data.data);
      setTotalPages((prev) => ({ ...prev, mesinTahapan: res.data.total_page }));
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (type: keyof typeof searches) => {
    setPage(1);
    getMesinTahapanList();
  };

  const handleResetSearch = (type: keyof typeof searches) => {
    setSearches((prev) => ({ ...prev, [type]: '' }));
    setPage(1);
    getMesinTahapanList();
  };

  const openModal = (type: ModalType, item?: MesinTahapan) => {
    setActiveModal(type);
    if (item && item.id) {
      setEditingId(item.id);
      setMesinTahapanForm({
        kode_mesin: item.kode_mesin || '',
        nama_mesin: item.nama_mesin || '',
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
    setMesinTahapanForm({
      kode_mesin: '',
      nama_mesin: '',
    });
  };

  async function createMesinTahapan(data: Omit<MesinTahapan, 'id'>) {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesinTahapan`;
    try {
      setLoading(true);
      console.log('Creating mesin tahapan with data:', data);
      const res = await axios.post(url, data, {
        withCredentials: true,
      });

      getMesinTahapanList();
      closeModal();
      return res.data;
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function updateMesinTahapan(
    id: number,
    data: Omit<MesinTahapan, 'id'>,
  ) {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesinTahapan/${id}`;
    try {
      setLoading(true);
      console.log('Updating mesin tahapan with data:', data);
      const res = await axios.put(url, data, { withCredentials: true });
      getMesinTahapanList();
      closeModal();
      return res.data;
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteMesinTahapan(id: number) {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesinTahapan/${id}`;
    try {
      if (confirm('Are you sure you want to delete this mesin tahapan?')) {
        const res = await axios.delete(url, { withCredentials: true });
        getMesinTahapanList();
        return res.data;
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateMesinTahapan(editingId, mesinTahapanForm);
    } else {
      await createMesinTahapan(mesinTahapanForm);
    }
  };

  return (
    <DefaultLayout>
      <div className="p-4">
        <p className="font-semibold md:text-[24px] text-[18px] text-primary mb-4">
          Master Data &gt; Mesin Tahapan
        </p>

        {/* Search and Add Button */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search mesin tahapan..."
              value={searches.mesinTahapan}
              onChange={(e) =>
                setSearches((prev) => ({
                  ...prev,
                  mesinTahapan: e.target.value,
                }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch('mesinTahapan');
                }
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <button
              onClick={() => handleSearch('mesinTahapan')}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={() => handleResetSearch('mesinTahapan')}
              disabled={loading}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
          <button
            onClick={() => openModal('mesinTahapan')}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Mesin Tahapan
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
                  Kode Mesin
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Mesin
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mesinTahapanList.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {(page - 1) * 15 + index + 1}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {item.kode_mesin || '-'}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {item.nama_mesin}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs font-medium space-x-1">
                    <button
                      onClick={() => openModal('mesinTahapan', item)}
                      className="text-blue-600 hover:text-blue-900 px-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMesinTahapan(item.id!)}
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
              count={totalPages.mesinTahapan}
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
        {activeModal === 'mesinTahapan' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? 'Edit Mesin Tahapan' : 'Add Mesin Tahapan'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kode Mesin (Optional)
                    </label>
                    <input
                      type="text"
                      value={mesinTahapanForm.kode_mesin}
                      onChange={(e) =>
                        setMesinTahapanForm((prev) => ({
                          ...prev,
                          kode_mesin: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nama Mesin
                    </label>
                    <input
                      type="text"
                      value={mesinTahapanForm.nama_mesin}
                      onChange={(e) =>
                        setMesinTahapanForm((prev) => ({
                          ...prev,
                          nama_mesin: e.target.value,
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

export default MasterMesinTahapan;
