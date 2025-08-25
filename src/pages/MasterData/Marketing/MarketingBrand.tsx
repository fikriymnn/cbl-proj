import { useState, useEffect } from 'react';
import axios from 'axios';
import { Stack, Pagination } from '@mui/material';
import DefaultLayout from '../../../layout/DefaultLayout';

// Types
interface MasterBrand {
  id: number;
  kode_brand: string;
  nama_brand: string;
}

interface MasterBrandForm {
  kode_brand: string;
  nama_brand: string;
}

interface SearchState {
  brands: string;
}

interface TotalPages {
  brands: number;
}

interface ApiResponse<T> {
  data: T;
  total_page: number;
}

function MasterBrand(): JSX.Element {
  const [brands, setBrands] = useState<MasterBrand[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<TotalPages>({ brands: 0 });
  const [searches, setSearches] = useState<SearchState>({ brands: '' });
  const [brandForm, setBrandForm] = useState<MasterBrandForm>({
    kode_brand: '',
    nama_brand: '',
  });
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingBrand, setEditingBrand] = useState<MasterBrand | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    getMasterBrand();
  }, [page]);

  // Fetch master brand data
  async function getMasterBrand(): Promise<void> {
    const url = `${import.meta.env.VITE_API_LINK}/master/brand`;
    try {
      setLoading(true);
      const res = await axios.get<ApiResponse<MasterBrand[]>>(url, {
        params: {
          page: page,
          limit: 15,
          search: searches.brands || undefined,
        },
        withCredentials: true,
      });
      console.log('Fetched brand data:', res.data);
      setBrands(res.data.data);
      setTotalPages((prev) => ({ ...prev, brands: res.data.total_page }));
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (): void => {
    setPage(1);
    getMasterBrand();
  };

  const handleReset = (): void => {
    setSearches({ brands: '' });
    setPage(1);
    getMasterBrand();
  };

  const handleAddBrand = (): void => {
    setShowForm(true);
    setEditingBrand(null);
    setBrandForm({ kode_brand: '', nama_brand: '' });
  };

  const openModal = (brand: MasterBrand): void => {
    setEditingBrand(brand);
    setBrandForm({
      kode_brand: brand.kode_brand,
      nama_brand: brand.nama_brand,
    });
    setShowForm(true);
  };

  const closeModal = (): void => {
    setShowForm(false);
    setEditingBrand(null);
    setBrandForm({ kode_brand: '', nama_brand: '' });
  };

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = editingBrand
        ? `${import.meta.env.VITE_API_LINK}/master/brand/${editingBrand.id}`
        : `${import.meta.env.VITE_API_LINK}/master/brand`;

      const method = editingBrand ? 'put' : 'post';

      console.log(
        editingBrand
          ? 'Updating brand with data:'
          : 'Creating brand with data:',
        brandForm,
      );
      await axios[method](url, brandForm, { withCredentials: true });

      getMasterBrand();
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

  const deleteBrand = async (id: number): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/master/brand/${id}`;
    try {
      if (confirm('Are you sure you want to delete this brand data?')) {
        await axios.delete(url, { withCredentials: true });
        getMasterBrand();
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <DefaultLayout>
      <div className="p-4">
        <p className="font-semibold md:text-[24px] text-[18px] text-primary mb-4">
          Master Data &gt; Master Brand
        </p>

        {/* Search and Add Button */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search brand..."
              value={searches.brands}
              onChange={(e) =>
                setSearches({ ...searches, brands: e.target.value })
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
            onClick={handleAddBrand}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Brand
          </button>
        </div>

        {/* Brand Table */}
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full table-auto text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kode Brand
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Brand
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {brands.map((brand, index) => (
                <tr key={brand.id}>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {(page - 1) * 15 + index + 1}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {brand.kode_brand}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 max-w-[150px] truncate">
                    {brand.nama_brand}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs font-medium space-x-1">
                    <button
                      onClick={() => openModal(brand)}
                      className="text-blue-600 hover:text-blue-900 px-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBrand(brand.id)}
                      className="text-red-600 hover:text-red-900 px-1"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {brands.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-2 py-2 text-center text-xs text-gray-500"
                  >
                    No brand data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="w-full flex justify-center mt-3 pb-2">
          <Stack spacing={2}>
            <Pagination
              count={totalPages.brands}
              page={page}
              color="primary"
              size="small"
              onChange={handlePageChange}
            />
          </Stack>
        </div>

        {/* Add/Edit Brand Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingBrand ? 'Edit Brand' : 'Add Brand'}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Kode Brand
                  </label>
                  <input
                    type="text"
                    placeholder="Enter kode brand"
                    value={brandForm.kode_brand}
                    onChange={(e) =>
                      setBrandForm({
                        ...brandForm,
                        kode_brand: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nama Brand
                  </label>
                  <input
                    type="text"
                    placeholder="Enter nama brand"
                    value={brandForm.nama_brand}
                    onChange={(e) =>
                      setBrandForm({
                        ...brandForm,
                        nama_brand: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
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
                    {loading ? 'Saving...' : editingBrand ? 'Update' : 'Save'}
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

export default MasterBrand;
