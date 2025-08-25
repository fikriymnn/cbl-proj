import { useEffect, useState } from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import axios from 'axios';
import { Stack, Pagination } from '@mui/material';
import SearchableSelect from './SearchableSelect'; // Adjust path as needed

interface Gudang {
  id?: number;
  alamat_gudang: string;
  telepon_gudang: string;
}

// Simplified Customer interface for dropdown
interface CustomerDropdown {
  id: number;
  nama_customer: string;
  email: string;
  telepon: string;
  alamat_kantor: string;
  is_active: boolean;
  gudang: Gudang[];
}

interface Produk {
  id?: number;
  id_customer: number;
  kode: string;
  nama_produk: string;
  keterangan: string;
  customer?: CustomerDropdown; // For displaying customer info in table
}

type ModalType = 'produk' | null;

function MasterProduk() {
  const [produks, setProduks] = useState<Produk[]>([]);
  const [customers, setCustomers] = useState<CustomerDropdown[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerDropdown | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState({
    produks: 1,
  });

  // Form states
  const [produkForm, setProdukForm] = useState<Omit<Produk, 'id'>>({
    id_customer: 0,
    kode: '',
    nama_produk: '',
    keterangan: '',
  });

  const [searches, setSearches] = useState({
    produks: '',
  });

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Updated: Only trigger on page changes, not search changes
  useEffect(() => {
    getProduks();
  }, [page]);

  // Load customers on mount
  useEffect(() => {
    getCustomers();
  }, []);

  // Fetch produks
  async function getProduks() {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/produk`;
    try {
      setLoading(true);
      const res = await axios.get(url, {
        params: {
          page: page,
          limit: 15,
          search: searches.produks || undefined,
        },
        withCredentials: true,
      });
      console.log('Fetched produks:', res.data);
      setProduks(res.data.data);
      setTotalPages((prev) => ({ ...prev, produks: res.data.total_page }));
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  // Fetch customers list
  async function getCustomers() {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/customer`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      // Filter only active customers and map to simplified interface
      const activeCustomers = res.data.data
        .filter((customer: any) => customer.is_active)
        .map((customer: any) => ({
          id: customer.id,
          nama_customer: customer.nama_customer,
          email: customer.email,
          telepon: customer.telepon,
          alamat_kantor: customer.alamat_kantor,
          is_active: customer.is_active,
          gudang: customer.gudang || [],
        }));
      console.log('Fetched customers:', activeCustomers);
      setCustomers(activeCustomers);
    } catch (error: any) {
      console.log(error);
    }
  }

  // Updated: Search functions now explicitly call API
  const handleSearch = (type: keyof typeof searches) => {
    setPage(1);
    getProduks(); // Explicitly call the API
  };

  const handleResetSearch = (type: keyof typeof searches) => {
    setSearches((prev) => ({ ...prev, [type]: '' }));
    setPage(1);
    getProduks(); // Explicitly call the API after reset
  };

  // Handle customer selection in form
  const handleCustomerSelect = (customerId: number) => {
    const customer = customers.find((c) => c.id === customerId);
    setSelectedCustomer(customer || null);
    setProdukForm((prev) => ({
      ...prev,
      id_customer: customerId,
    }));
  };

  // Updated: Modal control functions
  const openModal = (type: ModalType, item?: Produk) => {
    setActiveModal(type);
    if (item && item.id) {
      setEditingId(item.id);
      setProdukForm({
        id_customer: item.id_customer || 0,
        kode: item.kode || '',
        nama_produk: item.nama_produk || '',
        keterangan: item.keterangan || '',
      });
      // Set selected customer for display
      const customer = customers.find((c) => c.id === item.id_customer);
      setSelectedCustomer(customer || null);
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
    setProdukForm({
      id_customer: 0,
      kode: '',
      nama_produk: '',
      keterangan: '',
    });
    setSelectedCustomer(null);
  };

  // Updated: CRUD functions
  async function createProduk(produkData: Omit<Produk, 'id'>) {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/produk`;
    try {
      setLoading(true);
      console.log('Creating produk with data:', produkData);
      const res = await axios.post(url, produkData, {
        withCredentials: true,
      });

      getProduks();
      closeModal();
      return res.data;
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function updateProduk(id: number, produkData: Omit<Produk, 'id'>) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/marketing/produk/${id}`;
    try {
      setLoading(true);
      console.log('Updating produk with data:', produkData);
      const res = await axios.put(url, produkData, { withCredentials: true });
      getProduks();
      closeModal();
      return res.data;
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduk(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/marketing/produk/${id}`;
    try {
      if (confirm('Are you sure you want to delete this produk?')) {
        const res = await axios.delete(url, { withCredentials: true });
        getProduks();
        return res.data;
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateProduk(editingId, produkForm);
    } else {
      await createProduk(produkForm);
    }
  };

  // Helper function to get customer name by ID
  const getCustomerName = (customerId: number) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.nama_customer : 'Unknown Customer';
  };

  return (
    <DefaultLayout>
      <div className="p-4">
        <p className="font-semibold md:text-[24px] text-[18px] text-primary mb-4">
          Master Data Marketing &gt; Produk
        </p>

        {/* Search and Add Button */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search produks..."
              value={searches.produks}
              onChange={(e) =>
                setSearches((prev) => ({ ...prev, produks: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch('produks');
                }
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <button
              onClick={() => handleSearch('produks')}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={() => handleResetSearch('produks')}
              disabled={loading}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
          <button
            onClick={() => openModal('produk')}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Produk
          </button>
        </div>

        {/* Produk Table */}
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
                  Nama Produk
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keterangan
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {produks.map((produk, index) => (
                <tr key={produk.id}>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {(page - 1) * 15 + index + 1}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {produk.kode}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 max-w-[150px] truncate">
                    {produk.nama_produk}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 max-w-[120px] truncate">
                    {getCustomerName(produk.id_customer)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 max-w-[200px] truncate">
                    {produk.keterangan}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs font-medium space-x-1">
                    <button
                      onClick={() => openModal('produk', produk)}
                      className="text-blue-600 hover:text-blue-900 px-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduk(produk.id!)}
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
              count={totalPages.produks}
              page={page}
              color="primary"
              size="small"
              onChange={(e, i) => {
                setPage(i);
              }}
            />
          </Stack>
        </div>

        {/* Produk Modal */}
        {activeModal === 'produk' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? 'Edit Produk' : 'Add Produk'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Selection */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Customer *
                    </label>
                    <SearchableSelect
                      options={[
                        { value: 0, label: 'Select Customer' },
                        ...customers.map((customer) => ({
                          value: customer.id,
                          label: `${customer.nama_customer}`,
                        })),
                      ]}
                      value={produkForm.id_customer}
                      onChange={(value) => handleCustomerSelect(Number(value))}
                      placeholder="Select Customer"
                      required
                    />
                  </div>

                  {/* Customer Info Display */}
                  {selectedCustomer && (
                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-md">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Customer Information:
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Name:</span>{' '}
                          {selectedCustomer.nama_customer}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span>{' '}
                          {selectedCustomer.email}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span>{' '}
                          {selectedCustomer.telepon}
                        </div>

                        <div className="md:col-span-2">
                          <span className="font-medium">Office Address:</span>{' '}
                          {selectedCustomer.alamat_kantor}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Produk Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kode Produk *
                    </label>
                    <input
                      type="text"
                      value={produkForm.kode}
                      onChange={(e) =>
                        setProdukForm((prev) => ({
                          ...prev,
                          kode: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                      placeholder="e.g., P-00001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nama Produk *
                    </label>
                    <input
                      type="text"
                      value={produkForm.nama_produk}
                      onChange={(e) =>
                        setProdukForm((prev) => ({
                          ...prev,
                          nama_produk: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                      placeholder="Enter product name"
                    />
                  </div>
                </div>

                {/* Keterangan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Keterangan
                  </label>
                  <textarea
                    value={produkForm.keterangan}
                    onChange={(e) =>
                      setProdukForm((prev) => ({
                        ...prev,
                        keterangan: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows={3}
                    placeholder="Enter product description..."
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
                    disabled={loading || produkForm.id_customer === 0}
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

export default MasterProduk;
