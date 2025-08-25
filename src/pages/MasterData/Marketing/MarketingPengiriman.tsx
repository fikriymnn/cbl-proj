import { useState, useEffect } from 'react';
import axios from 'axios';
import { Stack, Pagination } from '@mui/material';
import DefaultLayout from '../../../layout/DefaultLayout';

// Types
interface MarketingPengiriman {
  id: number;
  nama_area: string;
  harga: number;
}

interface MarketingPengirimanForm {
  nama_area: string;
  harga: number | string;
}

interface SearchState {
  pengirimans: string;
}

interface TotalPages {
  pengirimans: number;
}

interface ApiResponse<T> {
  data: T;
  total_page: number;
}

function MasterMarketingPengiriman(): JSX.Element {
  const [pengirimans, setPengirimans] = useState<MarketingPengiriman[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<TotalPages>({ pengirimans: 0 });
  const [searches, setSearches] = useState<SearchState>({ pengirimans: '' });
  const [pengirimanForm, setPengirimanForm] = useState<MarketingPengirimanForm>(
    {
      nama_area: '',
      harga: '',
    },
  );
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingPengiriman, setEditingPengiriman] =
    useState<MarketingPengiriman | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Updated: Only trigger on page changes, not search changes
  useEffect(() => {
    getMarketingPengiriman();
  }, [page]);

  // Fetch marketing pengiriman data
  async function getMarketingPengiriman(): Promise<void> {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/pengiriman`;
    try {
      setLoading(true);
      const res = await axios.get<ApiResponse<MarketingPengiriman[]>>(url, {
        params: {
          page: page,
          limit: 15,
          search: searches.pengirimans || undefined,
        },
        withCredentials: true,
      });
      console.log('Fetched pengiriman data:', res.data);
      setPengirimans(res.data.data);
      setTotalPages((prev) => ({ ...prev, pengirimans: res.data.total_page }));
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  // Updated: Search functions now explicitly call API
  const handleSearch = (): void => {
    setPage(1);
    getMarketingPengiriman(); // Explicitly call the API
  };

  const handleReset = (): void => {
    setSearches({ pengirimans: '' });
    setPage(1);
    getMarketingPengiriman(); // Explicitly call the API after reset
  };

  const handleAddPengiriman = (): void => {
    setShowForm(true);
    setEditingPengiriman(null);
    setPengirimanForm({ nama_area: '', harga: '' });
  };

  const openModal = (pengiriman: MarketingPengiriman): void => {
    setEditingPengiriman(pengiriman);
    setPengirimanForm({
      nama_area: pengiriman.nama_area,
      harga: pengiriman.harga,
    });
    setShowForm(true);
  };

  const closeModal = (): void => {
    setShowForm(false);
    setEditingPengiriman(null);
    setPengirimanForm({ nama_area: '', harga: '' });
  };

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = editingPengiriman
        ? `${import.meta.env.VITE_API_LINK}/master/marketing/pengiriman/${
            editingPengiriman.id
          }`
        : `${import.meta.env.VITE_API_LINK}/master/marketing/pengiriman`;

      const method = editingPengiriman ? 'put' : 'post';

      // Convert harga to number if it's a string
      const formData = {
        ...pengirimanForm,
        harga:
          typeof pengirimanForm.harga === 'string'
            ? parseFloat(pengirimanForm.harga) || 0
            : pengirimanForm.harga,
      };

      console.log(
        editingPengiriman
          ? 'Updating pengiriman with data:'
          : 'Creating pengiriman with data:',
        formData,
      );
      await axios[method](url, formData, { withCredentials: true });

      getMarketingPengiriman();
      closeModal();
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number,
  ): void => {
    setPage(value);
  };

  const deletePengiriman = async (id: number): Promise<void> => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/marketing/pengiriman/${id}`;
    try {
      if (confirm('Are you sure you want to delete this pengiriman data?')) {
        await axios.delete(url, { withCredentials: true });
        getMarketingPengiriman();
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <DefaultLayout>
      <div className="p-4">
        <p className="font-semibold md:text-[24px] text-[18px] text-primary mb-4">
          Master Data Marketing &gt; Marketing Pengiriman
        </p>

        {/* Search and Add Button */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search pengiriman..."
              value={searches.pengirimans}
              onChange={(e) =>
                setSearches({ ...searches, pengirimans: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
          <button
            onClick={handleAddPengiriman}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Pengiriman
          </button>
        </div>

        {/* Pengiriman Table */}
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full table-auto text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Area
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pengirimans.map((pengiriman, index) => (
                <tr key={pengiriman.id}>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {(page - 1) * 15 + index + 1}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 max-w-[150px] truncate">
                    {pengiriman.nama_area}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    Rp {pengiriman.harga.toLocaleString('id-ID')}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs font-medium space-x-1">
                    <button
                      onClick={() => openModal(pengiriman)}
                      className="text-blue-600 hover:text-blue-900 px-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePengiriman(pengiriman.id)}
                      className="text-red-600 hover:text-red-900 px-1"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {pengirimans.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-2 py-2 text-center text-xs text-gray-500"
                  >
                    No pengiriman data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="w-full flex justify-center mt-3 pb-2">
          <Stack spacing={2}>
            <Pagination
              count={totalPages.pengirimans}
              page={page}
              color="primary"
              size="small"
              onChange={handlePageChange}
            />
          </Stack>
        </div>

        {/* Add/Edit Pengiriman Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingPengiriman ? 'Edit Pengiriman' : 'Add Pengiriman'}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nama Area
                  </label>
                  <input
                    type="text"
                    placeholder="Enter nama area"
                    value={pengirimanForm.nama_area}
                    onChange={(e) =>
                      setPengirimanForm({
                        ...pengirimanForm,
                        nama_area: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Harga
                  </label>
                  <input
                    type="number"
                    placeholder="Enter harga"
                    value={pengirimanForm.harga}
                    onChange={(e) =>
                      setPengirimanForm({
                        ...pengirimanForm,
                        harga: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                    min="0"
                    step="0.01"
                  />
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
                    {loading
                      ? 'Saving...'
                      : editingPengiriman
                      ? 'Update'
                      : 'Save'}
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

export default MasterMarketingPengiriman;
