import { useEffect, useState } from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import axios from 'axios';
import { Stack, Pagination } from '@mui/material';
import SearchableSelect from './SearchableSelect'; // Adjust path as needed

interface Gudang {
  id?: number | null; // Updated to include optional id
  alamat_gudang: string;
  telepon_gudang: string;
}

interface Customer {
  id?: number;
  id_marketing: number;
  id_harga_pengiriman: number;
  nama_customer: string;
  email: string;
  npwp: string;
  kontak_person: string;
  alamat_kantor: string;
  telepon: string;
  no_legalitas: string;
  toleransi_pengiriman: string;
  top_faktur: string;
  fax: string;
  is_active: boolean;
  gudang: Gudang[];
}

interface Marketing {
  id: number;
  kode: string;
  id_karyawan: number;
  is_active: boolean;
  data_karyawan: {
    name: string;
    badgenumber: string;
    userid: number;
    biodata_karyawan: any[];
  };
  createdAt: string;
  updatedAt: string;
}

interface HargaPengiriman {
  id: number;
  nama_area: string;
  harga: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

type ModalType = 'customer' | null;

function MasterCustomer() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [marketingList, setMarketingList] = useState<Marketing[]>([]);
  const [hargaPengirimanList, setHargaPengirimanList] = useState<
    HargaPengiriman[]
  >([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState({
    customers: 1,
  });

  // Form states
  const [customerForm, setCustomerForm] = useState<Omit<Customer, 'id'>>({
    id_marketing: 0,
    id_harga_pengiriman: 0,
    nama_customer: '',
    email: '',
    npwp: '',
    kontak_person: '',
    alamat_kantor: '',
    telepon: '',
    no_legalitas: '',
    toleransi_pengiriman: '',
    top_faktur: '',
    fax: '',
    is_active: true,
    gudang: [{ alamat_gudang: '', telepon_gudang: '' }],
  });

  const [searches, setSearches] = useState({
    customers: '',
  });

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Updated: Only trigger on page changes, not search changes
  useEffect(() => {
    getMarketingCustomer();
  }, [page]);

  // Load marketing and pricing data on mount
  useEffect(() => {
    getMarketingList();
    getHargaPengirimanList();
  }, []);

  // Fetch customers
  async function getMarketingCustomer() {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/customer`;
    try {
      setLoading(true);
      const res = await axios.get(url, {
        params: {
          page: page,
          limit: 15,
          search: searches.customers || undefined,
        },
        withCredentials: true,
      });
      console.log('Fetched customers:', res.data);
      setCustomers(res.data.data);
      setTotalPages((prev) => ({ ...prev, customers: res.data.total_page }));
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  // Fetch marketing list
  async function getMarketingList() {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      setMarketingList(res.data.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  // Fetch harga pengiriman list
  async function getHargaPengirimanList() {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/pengiriman`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      setHargaPengirimanList(res.data.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  // Updated: Search functions now explicitly call API
  const handleSearch = (type: keyof typeof searches) => {
    setPage(1);
    getMarketingCustomer(); // Explicitly call the API
  };

  const handleResetSearch = (type: keyof typeof searches) => {
    setSearches((prev) => ({ ...prev, [type]: '' }));
    setPage(1);
    getMarketingCustomer(); // Explicitly call the API after reset
  };

  // Helper function to prepare data for API calls
  const prepareCustomerData = (formData: Omit<Customer, 'id'>) => {
    return {
      ...formData,
      gudang: formData.gudang.map((g) => {
        // If editing existing gudang (has ID), include it
        // If new gudang (no ID), don't include ID field
        if (g.id) {
          return {
            id: g.id,
            alamat_gudang: g.alamat_gudang,
            telepon_gudang: g.telepon_gudang,
          };
        } else {
          return {
            id: g.id,
            alamat_gudang: g.alamat_gudang,
            telepon_gudang: g.telepon_gudang,
          };
        }
      }),
    };
  };

  // Updated: Modal control functions
  const openModal = (type: ModalType, item?: Customer) => {
    setActiveModal(type);
    if (item && item.id) {
      setEditingId(item.id);
      setCustomerForm({
        id_marketing: item.id_marketing || 0,
        id_harga_pengiriman: item.id_harga_pengiriman || 0,
        nama_customer: item.nama_customer || '',
        email: item.email || '',
        npwp: item.npwp || '',
        kontak_person: item.kontak_person || '',
        alamat_kantor: item.alamat_kantor || '',
        telepon: item.telepon || '',
        no_legalitas: item.no_legalitas || '',
        toleransi_pengiriman: item.toleransi_pengiriman || '',
        top_faktur: item.top_faktur || '',
        fax: item.fax || '',
        is_active: item.is_active !== undefined ? item.is_active : true,
        gudang:
          item.gudang && item.gudang.length > 0
            ? item.gudang.map((g) => ({
                id: g.id || null,
                alamat_gudang: g.alamat_gudang || '',
                telepon_gudang: g.telepon_gudang || '',
              }))
            : [{ id: null, alamat_gudang: '', telepon_gudang: '' }],
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
    setCustomerForm({
      id_marketing: 0,
      id_harga_pengiriman: 0,
      nama_customer: '',
      email: '',
      npwp: '',
      kontak_person: '',
      alamat_kantor: '',
      telepon: '',
      no_legalitas: '',
      toleransi_pengiriman: '',
      top_faktur: '',
      fax: '',
      is_active: true,
      gudang: [{ alamat_gudang: '', telepon_gudang: '' }],
    });
  };

  // Updated: Gudang array handlers
  const addGudang = () => {
    setCustomerForm((prev) => ({
      ...prev,
      gudang: [...prev.gudang, { alamat_gudang: '', telepon_gudang: '' }], // No ID for new items
    }));
  };

  const removeGudang = (index: number) => {
    if (customerForm.gudang.length > 1) {
      setCustomerForm((prev) => ({
        ...prev,
        gudang: prev.gudang.filter((_, i) => i !== index),
      }));
    }
  };

  // Updated: updateGudang function to handle the ID field
  const updateGudang = (
    index: number,
    field: keyof Gudang,
    value: string | number,
  ) => {
    setCustomerForm((prev) => ({
      ...prev,
      gudang: prev.gudang.map((g, i) =>
        i === index ? { ...g, [field]: value } : g,
      ),
    }));
  };

  // Updated: CRUD functions
  async function createCustomer(customerData: Omit<Customer, 'id'>) {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/customer`;
    try {
      setLoading(true);
      const preparedData = prepareCustomerData(customerData);
      console.log('Creating customer with data:', preparedData);
      const res = await axios.post(url, preparedData, {
        withCredentials: true,
      });

      getMarketingCustomer();
      closeModal();
      return res.data;
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function updateCustomer(
    id: number,
    customerData: Omit<Customer, 'id'>,
  ) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/marketing/customer/${id}`;
    try {
      setLoading(true);
      const preparedData = prepareCustomerData(customerData);
      console.log('Updating customer with data:', preparedData);
      const res = await axios.put(url, preparedData, { withCredentials: true });
      getMarketingCustomer();
      closeModal();
      return res.data;
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCustomer(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/marketing/customer/${id}`;
    try {
      if (confirm('Are you sure you want to delete this customer?')) {
        const res = await axios.delete(url, { withCredentials: true });
        getMarketingCustomer();
        return res.data;
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateCustomer(editingId, customerForm);
    } else {
      await createCustomer(customerForm);
    }
  };

  return (
    <DefaultLayout>
      <div className="p-4">
        <p className="font-semibold md:text-[24px] text-[18px] text-primary mb-4">
          Master Data Marketing &gt; Customer
        </p>

        {/* Search and Add Button */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search customers..."
              value={searches.customers}
              onChange={(e) =>
                setSearches((prev) => ({ ...prev, customers: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch('customers');
                }
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <button
              onClick={() => handleSearch('customers')}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={() => handleResetSearch('customers')}
              disabled={loading}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
          <button
            onClick={() => openModal('customer')}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Customer
          </button>
        </div>

        {/* Customer Table - Made smaller */}
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full table-auto text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Customer
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telepon
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NPWP
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
              {customers.map((customer, index) => (
                <tr key={customer.id}>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {(page - 1) * 15 + index + 1}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 max-w-[120px] truncate">
                    {customer.nama_customer}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 max-w-[150px] truncate">
                    {customer.email}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {customer.telepon}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {customer.npwp}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    <span
                      className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded-full ${
                        customer.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {customer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs font-medium space-x-1">
                    <button
                      onClick={() => openModal('customer', customer)}
                      className="text-blue-600 hover:text-blue-900 px-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCustomer(customer.id!)}
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
              count={totalPages.customers}
              page={page}
              color="primary"
              size="small"
              onChange={(e, i) => {
                setPage(i);
              }}
            />
          </Stack>
        </div>

        {/* Customer Modal */}
        {activeModal === 'customer' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? 'Edit Customer' : 'Add Customer'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nama Customer
                    </label>
                    <input
                      type="text"
                      value={customerForm.nama_customer}
                      onChange={(e) =>
                        setCustomerForm((prev) => ({
                          ...prev,
                          nama_customer: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={customerForm.email}
                      onChange={(e) =>
                        setCustomerForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      NPWP
                    </label>
                    <input
                      type="text"
                      value={customerForm.npwp}
                      onChange={(e) =>
                        setCustomerForm((prev) => ({
                          ...prev,
                          npwp: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kontak Person
                    </label>
                    <input
                      type="text"
                      value={customerForm.kontak_person}
                      onChange={(e) =>
                        setCustomerForm((prev) => ({
                          ...prev,
                          kontak_person: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Telepon
                    </label>
                    <input
                      type="text"
                      value={customerForm.telepon}
                      onChange={(e) =>
                        setCustomerForm((prev) => ({
                          ...prev,
                          telepon: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fax
                    </label>
                    <input
                      type="text"
                      value={customerForm.fax}
                      onChange={(e) =>
                        setCustomerForm((prev) => ({
                          ...prev,
                          fax: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      No Legalitas
                    </label>
                    <input
                      type="text"
                      value={customerForm.no_legalitas}
                      onChange={(e) =>
                        setCustomerForm((prev) => ({
                          ...prev,
                          no_legalitas: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Marketing
                    </label>
                    <SearchableSelect
                      options={[
                        { value: 0, label: 'Select Marketing' },
                        ...marketingList.map((marketing) => ({
                          value: marketing.id,
                          label: `${marketing.kode} - ${
                            marketing.data_karyawan?.name || 'Unknown'
                          }`,
                        })),
                      ]}
                      value={customerForm.id_marketing}
                      onChange={(value) =>
                        setCustomerForm((prev) => ({
                          ...prev,
                          id_marketing: Number(value),
                        }))
                      }
                      placeholder="Select Marketing"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Harga Pengiriman
                    </label>
                    <SearchableSelect
                      options={[
                        { value: 0, label: 'Select Harga Pengiriman' },
                        ...hargaPengirimanList.map((harga) => ({
                          value: harga.id,
                          label: `${harga.nama_area} - Rp ${
                            harga.harga?.toLocaleString() || '0'
                          }`,
                        })),
                      ]}
                      value={customerForm.id_harga_pengiriman}
                      onChange={(value) =>
                        setCustomerForm((prev) => ({
                          ...prev,
                          id_harga_pengiriman: Number(value),
                        }))
                      }
                      placeholder="Select Harga Pengiriman"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Toleransi Pengiriman
                    </label>
                    <input
                      type="text"
                      value={customerForm.toleransi_pengiriman}
                      onChange={(e) =>
                        setCustomerForm((prev) => ({
                          ...prev,
                          toleransi_pengiriman: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      TOP Faktur (hari)
                    </label>
                    <input
                      type="text"
                      value={customerForm.top_faktur}
                      onChange={(e) =>
                        setCustomerForm((prev) => ({
                          ...prev,
                          top_faktur: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={customerForm.is_active}
                      onChange={(e) =>
                        setCustomerForm((prev) => ({
                          ...prev,
                          is_active: e.target.checked,
                        }))
                      }
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Alamat Kantor
                  </label>
                  <textarea
                    value={customerForm.alamat_kantor}
                    onChange={(e) =>
                      setCustomerForm((prev) => ({
                        ...prev,
                        alamat_kantor: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows={3}
                  />
                </div>

                {/* Updated: Gudang Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Gudang
                    </label>
                    <button
                      type="button"
                      onClick={addGudang}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      Add Gudang
                    </button>
                  </div>

                  {customerForm.gudang.map((gudang, index) => (
                    <div
                      key={gudang.id || `new-${index}`}
                      className="border p-4 rounded-md mb-2"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">
                          Gudang {index + 1}{' '}
                          {gudang.id ? `(ID: ${gudang.id})` : '(New)'}
                        </span>
                        {customerForm.gudang.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeGudang(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Alamat Gudang
                          </label>
                          <textarea
                            value={gudang.alamat_gudang}
                            onChange={(e) =>
                              updateGudang(
                                index,
                                'alamat_gudang',
                                e.target.value,
                              )
                            }
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            rows={2}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Telepon Gudang
                          </label>
                          <input
                            type="text"
                            value={gudang.telepon_gudang}
                            onChange={(e) =>
                              updateGudang(
                                index,
                                'telepon_gudang',
                                e.target.value,
                              )
                            }
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
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

export default MasterCustomer;
