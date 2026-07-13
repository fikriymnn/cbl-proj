import { useState, useEffect } from 'react';
import axios from 'axios';
import { Stack, Pagination } from '@mui/material';
import DefaultLayout from '../../../layout/DefaultLayout';

// Types
interface MasterVendor {
  id: number;
  nama_vendor: string;
  email: string;
  alamat: string;
  telepon: string;
  is_active: boolean;
  tipe_vendor: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface MasterVendorForm {
  nama_vendor: string;
  email: string;
  alamat: string;
  telepon: string;
  tipe_vendor: string[];
}

interface SearchState {
  vendors: string;
  tipe_vendor: string;
}

interface TotalPages {
  vendors: number;
}

interface ApiResponse<T> {
  succes: boolean;
  status_code: number;
  data: T;
  total_page?: number;
}

const TIPE_VENDOR_OPTIONS: string[] = [
  'tinta',
  'kertas',
  'lem',
  'coating',
  'poliban',
  'corrugated',
];

const emptyForm: MasterVendorForm = {
  nama_vendor: '',
  email: '',
  alamat: '',
  telepon: '',
  tipe_vendor: [],
};

function MasterVendor(): JSX.Element {
  const [vendors, setVendors] = useState<MasterVendor[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<TotalPages>({ vendors: 0 });
  const [searches, setSearches] = useState<SearchState>({
    vendors: '',
    tipe_vendor: '',
  });
  const [vendorForm, setVendorForm] = useState<MasterVendorForm>(emptyForm);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingVendor, setEditingVendor] = useState<MasterVendor | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    getMasterVendors();
  }, [page]);

  // Fetch master vendor data
  async function getMasterVendors(): Promise<void> {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/vendor/list`;
    try {
      setLoading(true);
      const res = await axios.get<ApiResponse<MasterVendor[]>>(url, {
        params: {
          page: page,
          limit: 15,
          search: searches.vendors || undefined,
          tipe_vendor: searches.tipe_vendor || undefined,
        },
        withCredentials: true,
      });
      console.log('Fetched vendor data:', res.data);
      setVendors(res.data.data);
      setTotalPages((prev) => ({
        ...prev,
        vendors: res.data.total_page || 1,
      }));
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (): void => {
    setPage(1);
    getMasterVendors();
  };

  const handleReset = (): void => {
    setSearches({ vendors: '', tipe_vendor: '' });
    setPage(1);
    getMasterVendors();
  };

  const handleAddVendor = (): void => {
    setShowForm(true);
    setEditingVendor(null);
    setVendorForm(emptyForm);
  };

  const openModal = (vendor: MasterVendor): void => {
    setEditingVendor(vendor);
    setVendorForm({
      nama_vendor: vendor.nama_vendor,
      email: vendor.email,
      alamat: vendor.alamat,
      telepon: vendor.telepon,
      tipe_vendor: vendor.tipe_vendor || [],
    });
    setShowForm(true);
  };

  const closeModal = (): void => {
    setShowForm(false);
    setEditingVendor(null);
    setVendorForm(emptyForm);
  };

  const toggleTipeVendor = (tipe: string): void => {
    setVendorForm((prev) => {
      const exists = prev.tipe_vendor.includes(tipe);
      return {
        ...prev,
        tipe_vendor: exists
          ? prev.tipe_vendor.filter((t) => t !== tipe)
          : [...prev.tipe_vendor, tipe],
      };
    });
  };

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (vendorForm.tipe_vendor.length === 0) {
      alert('Please select at least one Tipe Vendor');
      return;
    }

    try {
      setLoading(true);
      const url = editingVendor
        ? `${import.meta.env.VITE_API_LINK}/master/marketing/vendor/list/${
            editingVendor.id
          }`
        : `${import.meta.env.VITE_API_LINK}/master/marketing/vendor/list`;

      const method = editingVendor ? 'put' : 'post';

      const formData = {
        nama_vendor: vendorForm.nama_vendor,
        email: vendorForm.email,
        alamat: vendorForm.alamat,
        telepon: vendorForm.telepon,
        tipe_vendor: vendorForm.tipe_vendor,
      };

      console.log(
        editingVendor
          ? 'Updating vendor with data:'
          : 'Creating vendor with data:',
        formData,
      );
      await axios[method](url, formData, { withCredentials: true });

      getMasterVendors();
      closeModal();
      alert(
        editingVendor
          ? 'Vendor updated successfully!'
          : 'Vendor created successfully!',
      );
    } catch (error: any) {
      console.log(error);
      alert(
        'Error saving vendor: ' +
          (error.response?.data?.message || error.message),
      );
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

  const deleteVendor = async (id: number): Promise<void> => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/marketing/vendor/list/${id}`;
    try {
      if (confirm('Are you sure you want to delete this vendor data?')) {
        await axios.delete(url, { withCredentials: true });
        getMasterVendors();
        alert('Vendor deleted successfully!');
      }
    } catch (error: any) {
      console.log(error);
      alert(
        'Error deleting vendor: ' +
          (error.response?.data?.message || error.message),
      );
    }
  };

  return (
    <DefaultLayout>
      <div className="p-4">
        <p className="font-semibold md:text-[24px] text-[18px] text-primary mb-4">
          Master Data &gt; Master Vendor
        </p>

        {/* Search and Add Button */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Search vendor..."
              value={searches.vendors}
              onChange={(e) =>
                setSearches({ ...searches, vendors: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <select
              value={searches.tipe_vendor}
              onChange={(e) =>
                setSearches({ ...searches, tipe_vendor: e.target.value })
              }
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="">All Tipe Vendor</option>
              {TIPE_VENDOR_OPTIONS.map((tipe) => (
                <option key={tipe} value={tipe}>
                  {tipe}
                </option>
              ))}
            </select>
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
            onClick={handleAddVendor}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Vendor
          </button>
        </div>

        {/* Vendor Table */}
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full table-auto text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Vendor
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telepon
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alamat
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe Vendor
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
              {vendors.map((vendor, index) => (
                <tr key={vendor.id}>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {(page - 1) * 15 + index + 1}
                  </td>
                  <td
                    className="px-2 py-2 text-xs text-gray-900 max-w-[150px] truncate"
                    title={vendor.nama_vendor}
                  >
                    {vendor.nama_vendor}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {vendor.email}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {vendor.telepon}
                  </td>
                  <td
                    className="px-2 py-2 text-xs text-gray-900 max-w-[180px] truncate"
                    title={vendor.alamat}
                  >
                    {vendor.alamat}
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-900 max-w-[150px]">
                    <div className="flex flex-wrap gap-1">
                      {vendor.tipe_vendor?.map((tipe) => (
                        <span
                          key={tipe}
                          className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-700"
                        >
                          {tipe}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        vendor.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {vendor.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs font-medium space-x-1">
                    <button
                      onClick={() => openModal(vendor)}
                      className="text-blue-600 hover:text-blue-900 px-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteVendor(vendor.id)}
                      className="text-red-600 hover:text-red-900 px-1"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {vendors.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-2 py-2 text-center text-xs text-gray-500"
                  >
                    No vendor data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="w-full flex justify-center mt-3 pb-2">
          <Stack spacing={2}>
            <Pagination
              count={totalPages.vendors}
              page={page}
              color="primary"
              size="small"
              onChange={handlePageChange}
            />
          </Stack>
        </div>

        {/* Add/Edit Vendor Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingVendor ? 'Edit Vendor' : 'Add Vendor'}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama Vendor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nama Vendor *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter nama vendor"
                      value={vendorForm.nama_vendor}
                      onChange={(e) =>
                        setVendorForm({
                          ...vendorForm,
                          nama_vendor: e.target.value,
                        })
                      }
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Enter email"
                      value={vendorForm.email}
                      onChange={(e) =>
                        setVendorForm({
                          ...vendorForm,
                          email: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Telepon */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Telepon
                    </label>
                    <input
                      type="text"
                      placeholder="Enter telepon"
                      value={vendorForm.telepon}
                      onChange={(e) =>
                        setVendorForm({
                          ...vendorForm,
                          telepon: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Alamat */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Alamat
                    </label>
                    <textarea
                      placeholder="Enter alamat"
                      value={vendorForm.alamat}
                      onChange={(e) =>
                        setVendorForm({
                          ...vendorForm,
                          alamat: e.target.value,
                        })
                      }
                      rows={2}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Tipe Vendor - Multi Select Checkboxes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipe Vendor *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border border-gray-300 rounded-md p-3">
                      {TIPE_VENDOR_OPTIONS.map((tipe) => (
                        <label
                          key={tipe}
                          className="flex items-center gap-2 text-sm text-gray-700 capitalize"
                        >
                          <input
                            type="checkbox"
                            checked={vendorForm.tipe_vendor.includes(tipe)}
                            onChange={() => toggleTipeVendor(tipe)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          {tipe}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingVendor ? 'Update' : 'Save'}
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

export default MasterVendor;
