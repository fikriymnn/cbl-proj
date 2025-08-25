import { useState, useEffect } from 'react';
import axios from 'axios';
import { Stack, Pagination } from '@mui/material';
import DefaultLayout from '../../../layout/DefaultLayout';
import SearchableSelect from '../../MasterData/Marketing/SearchableSelect';

// Types
interface Marketing {
  data_karyawan: any;
  id: number;
  kode: string;
  id_karyawan: number;
  is_active?: boolean;
}

interface Karyawan {
  data_karyawan: any;
  id: number;
  nama?: string;
  name?: string;
}

interface MarketingForm {
  id_karyawan: number | string;
  kode: string;
  is_active: boolean;
}

interface SearchState {
  marketings: string;
}

interface TotalPages {
  marketings: number;
}

interface ApiResponse<T> {
  data: T;
  total_page: number;
}

function MasterMarketing(): JSX.Element {
  const [marketings, setMarketings] = useState<Marketing[]>([]);
  const [karyawans, setKaryawans] = useState<Karyawan[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<TotalPages>({ marketings: 0 });
  const [searches, setSearches] = useState<SearchState>({ marketings: '' });
  const [marketingForm, setMarketingForm] = useState<MarketingForm>({
    id_karyawan: '',
    kode: '',
    is_active: true,
  });
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingMarketing, setEditingMarketing] = useState<Marketing | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);

  // Updated: Only trigger on page changes, not search changes
  useEffect(() => {
    getMarketing();
  }, [page]);

  // Load karyawan data on mount
  useEffect(() => {
    getKaryawan();
  }, []);

  // Fetch marketing data
  async function getMarketing(): Promise<void> {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing`;
    try {
      setLoading(true);
      const res = await axios.get<ApiResponse<Marketing[]>>(url, {
        params: {
          page: page,
          limit: 15,
          search: searches.marketings || undefined,
        },
        withCredentials: true,
      });
      console.log('Fetched marketings:', res.data);
      setMarketings(res.data.data);
      setTotalPages((prev) => ({ ...prev, marketings: res.data.total_page }));
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  // Fetch karyawan data
  async function getKaryawan(): Promise<void> {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;
    try {
      const res = await axios.get<ApiResponse<Karyawan[]>>(url, {
        params: {},
        withCredentials: true,
      });
      setKaryawans(res.data.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  // Updated: Search functions now explicitly call API
  const handleSearch = (): void => {
    setPage(1);
    getMarketing(); // Explicitly call the API
  };

  const handleReset = (): void => {
    setSearches({ marketings: '' });
    setPage(1);
    getMarketing(); // Explicitly call the API after reset
  };

  const handleAddMarketing = (): void => {
    setShowForm(true);
    setEditingMarketing(null);
    setMarketingForm({ id_karyawan: '', kode: '', is_active: true });
  };

  const openModal = (marketing: Marketing): void => {
    setEditingMarketing(marketing);
    setMarketingForm({
      id_karyawan: marketing.id_karyawan,
      kode: marketing.kode,
      is_active: marketing.is_active !== undefined ? marketing.is_active : true,
    });
    setShowForm(true);
  };

  const closeModal = (): void => {
    setShowForm(false);
    setEditingMarketing(null);
    setMarketingForm({ id_karyawan: '', kode: '', is_active: true });
  };

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = editingMarketing
        ? `${import.meta.env.VITE_API_LINK}/master/marketing/${
            editingMarketing.id
          }`
        : `${import.meta.env.VITE_API_LINK}/master/marketing`;

      const method = editingMarketing ? 'put' : 'post';

      console.log(
        editingMarketing
          ? 'Updating marketing with data:'
          : 'Creating marketing with data:',
        marketingForm,
      );
      await axios[method](url, marketingForm, { withCredentials: true });

      getMarketing();
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

  const handleKaryawanChange = (value: number | string): void => {
    setMarketingForm({
      ...marketingForm,
      id_karyawan: value,
    });
  };

  const deleteMarketing = async (id: number): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/${id}`;
    try {
      if (confirm('Are you sure you want to delete this marketing?')) {
        await axios.delete(url, { withCredentials: true });
        getMarketing();
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <DefaultLayout>
      <div className="p-4">
        <p className="font-semibold md:text-[24px] text-[18px] text-primary mb-4">
          Master Data Marketing &gt; Marketing
        </p>

        {/* Search and Add Button */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search marketing..."
              value={searches.marketings}
              onChange={(e) =>
                setSearches({ ...searches, marketings: e.target.value })
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
            onClick={handleAddMarketing}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Marketing
          </button>
        </div>

        {/* Marketing Table - Made smaller */}
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full table-auto text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kode
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Karyawan
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {marketings.map((marketing, index) => (
                <tr key={marketing.id}>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {(page - 1) * 15 + index + 1}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 max-w-[120px] truncate">
                    {marketing.kode}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 max-w-[150px] truncate">
                    {marketing.data_karyawan?.name || '-'}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    <span
                      className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded-full ${
                        marketing.is_active !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {marketing.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs font-medium space-x-1">
                    <button
                      onClick={() => openModal(marketing)}
                      className="text-blue-600 hover:text-blue-900 px-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMarketing(marketing.id)}
                      className="text-red-600 hover:text-red-900 px-1"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {marketings.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-2 py-2 text-center text-xs text-gray-500"
                  >
                    No marketing data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="w-full flex justify-center mt-3 pb-2">
          <Stack spacing={2}>
            <Pagination
              count={totalPages.marketings}
              page={page}
              color="primary"
              size="small"
              onChange={handlePageChange}
            />
          </Stack>
        </div>

        {/* Add/Edit Marketing Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingMarketing ? 'Edit Marketing' : 'Add Marketing'}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Kode
                  </label>
                  <input
                    type="text"
                    placeholder="Enter kode"
                    value={marketingForm.kode}
                    onChange={(e) =>
                      setMarketingForm({
                        ...marketingForm,
                        kode: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Karyawan
                  </label>
                  <SearchableSelect
                    options={[
                      { value: '', label: 'Select Karyawan' },
                      ...karyawans.map((karyawan) => ({
                        value: karyawan.id,
                        label: karyawan.nama || karyawan.name || '',
                      })),
                    ]}
                    value={marketingForm.id_karyawan}
                    onChange={handleKaryawanChange}
                    placeholder="Select Karyawan"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={marketingForm.is_active}
                    onChange={(e) =>
                      setMarketingForm({
                        ...marketingForm,
                        is_active: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Active
                  </label>
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
                      : editingMarketing
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

export default MasterMarketing;
