import axios from 'axios';
import { useEffect, useState } from 'react';
import { Stack, Pagination } from '@mui/material';

interface Customer {
  id?: number;
  id_marketing: number;
  id_produk: number;
  id_harga_pengiriman: number;
  nama_customer: string;
  email: string;
  alamat_kantor: string;
  alamat_gudang: string;
  telepon: string;
  toleransi_pengiriman: string;
  top_faktur: number;
}

interface Produk {
  id?: number;
  kode: string;
  nama_produk: string;
  keterangan: string;
}

interface Pengiriman {
  id?: number;
  nama_area: string;
  harga: number;
}

interface Marketing {
  id?: number;
  kode: string;
  id_karyawan: number;
}

interface Karyawan {
  userid: number;
  name: string;
}

interface SearchableSelectProps {
  options: { value: number; label: string }[];
  value: number;
  onChange: (value: number) => void;
  placeholder: string;
  className?: string;
}

// Custom SearchableSelect Component
const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (optionValue: number) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="w-full border rounded px-2 py-1 cursor-pointer bg-white flex justify-between items-center text-xs"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-3 h-3 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-hidden">
          <div className="p-1 border-b">
            <input
              type="text"
              className="w-full px-2 py-1 border rounded text-xs"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-36 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-1 text-gray-500 text-xs">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`px-2 py-1 cursor-pointer hover:bg-gray-100 text-xs ${
                    value === option.value ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

type ModalType = 'customer' | 'produk' | 'pengiriman' | 'marketing' | null;

const MasterDataKalkulasi = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [produks, setProduks] = useState<Produk[]>([]);
  const [pengirimans, setPengirimans] = useState<Pengiriman[]>([]);
  const [marketings, setMarketings] = useState<Marketing[]>([]);
  const [karyawans, setKaryawans] = useState<Karyawan[]>([]);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState({
    customers: 1,
    produks: 1,
    pengirimans: 1,
    marketings: 1,
  });

  // Search states
  const [searches, setSearches] = useState({
    customers: '',
    produks: '',
    pengirimans: '',
    marketings: '',
  });

  // Form states
  const [customerForm, setCustomerForm] = useState<Omit<Customer, 'id'>>({
    id_marketing: 0,
    id_produk: 0,
    id_harga_pengiriman: 0,
    nama_customer: '',
    email: '',
    alamat_kantor: '',
    alamat_gudang: '',
    telepon: '',
    toleransi_pengiriman: '',
    top_faktur: 0,
  });

  const [produkForm, setProdukForm] = useState<Omit<Produk, 'id'>>({
    kode: '',
    nama_produk: '',
    keterangan: '',
  });

  const [pengirimanForm, setPengirimanForm] = useState<Omit<Pengiriman, 'id'>>({
    nama_area: '',
    harga: 0,
  });

  const [marketingForm, setMarketingForm] = useState<Omit<Marketing, 'id'>>({
    kode: '',
    id_karyawan: 0,
  });

  useEffect(() => {
    getMarketingProduk();
    getMarketing();
    getMarketingPengiriman();
    getMarketingCustomer();
    getKaryawan();
  }, [page]);

  // GET functions with search
  async function getMarketingProduk() {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/produk`;
    try {
      const res = await axios.get(url, {
        params: {
          page: page,
          limit: 5,
          search: searches.produks || undefined,
        },
        withCredentials: true,
      });
      setProduks(res.data.data);
      setTotalPages((prev) => ({ ...prev, produks: res.data.total_page }));
    } catch (error: any) {
      console.log(error);
    }
  }

  async function getMarketing() {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing`;
    try {
      const res = await axios.get(url, {
        params: {
          page: page,
          limit: 5,
          search: searches.marketings || undefined,
        },
        withCredentials: true,
      });
      setMarketings(res.data.data);
      setTotalPages((prev) => ({ ...prev, marketings: res.data.total_page }));
    } catch (error: any) {
      console.log(error);
    }
  }

  async function getMarketingPengiriman() {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/pengiriman`;
    try {
      const res = await axios.get(url, {
        params: {
          page: page,
          limit: 5,
          search: searches.pengirimans || undefined,
        },
        withCredentials: true,
      });
      setPengirimans(res.data.data);
      setTotalPages((prev) => ({ ...prev, pengirimans: res.data.total_page }));
    } catch (error: any) {
      console.log(error);
    }
  }

  async function getMarketingCustomer() {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/customer`;
    try {
      const res = await axios.get(url, {
        params: {
          page: page,
          limit: 5,
          search: searches.customers || undefined,
        },
        withCredentials: true,
      });
      console.log(res.data);
      setCustomers(res.data.data);
      setTotalPages((prev) => ({ ...prev, customers: res.data.total_page }));
    } catch (error: any) {
      console.log(error);
    }
  }

  async function getKaryawan() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;
    try {
      const res = await axios.get(url, { params: {}, withCredentials: true });
      setKaryawans(res.data.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  // Search functions
  const handleSearch = (type: keyof typeof searches) => {
    setPage(1); // Reset to first page when searching
    switch (type) {
      case 'customers':
        getMarketingCustomer();
        break;
      case 'produks':
        getMarketingProduk();
        break;
      case 'pengirimans':
        getMarketingPengiriman();
        break;
      case 'marketings':
        getMarketing();
        break;
    }
  };

  const handleResetSearch = (type: keyof typeof searches) => {
    setSearches((prev) => ({ ...prev, [type]: '' }));
    setPage(1);
    setTimeout(() => {
      switch (type) {
        case 'customers':
          getMarketingCustomer();
          break;
        case 'produks':
          getMarketingProduk();
          break;
        case 'pengirimans':
          getMarketingPengiriman();
          break;
        case 'marketings':
          getMarketing();
          break;
      }
    }, 0);
  };

  // Modal control functions
  const openModal = (type: ModalType, item?: any) => {
    setActiveModal(type);
    if (item) {
      setEditingId(item.id);
      switch (type) {
        case 'customer':
          setCustomerForm({
            id_marketing: item.id_marketing,
            id_produk: item.id_produk,
            id_harga_pengiriman: item.id_harga_pengiriman,
            nama_customer: item.nama_customer,
            email: item.email,
            alamat_kantor: item.alamat_kantor,
            alamat_gudang: item.alamat_gudang,
            telepon: item.telepon,
            toleransi_pengiriman: item.toleransi_pengiriman,
            top_faktur: item.top_faktur,
          });
          break;
        case 'produk':
          setProdukForm({
            kode: item.kode,
            nama_produk: item.nama_produk,
            keterangan: item.keterangan,
          });
          break;
        case 'pengiriman':
          setPengirimanForm({
            nama_area: item.nama_area,
            harga: item.harga,
          });
          break;
        case 'marketing':
          setMarketingForm({
            kode: item.kode,
            id_karyawan: item.id_karyawan,
          });
          break;
      }
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
      id_produk: 0,
      id_harga_pengiriman: 0,
      nama_customer: '',
      email: '',
      alamat_kantor: '',
      alamat_gudang: '',
      telepon: '',
      toleransi_pengiriman: '',
      top_faktur: 0,
    });
    setProdukForm({ kode: '', nama_produk: '', keterangan: '' });
    setPengirimanForm({ nama_area: '', harga: 0 });
    setMarketingForm({ kode: '', id_karyawan: 0 });
  };

  // CRUD functions (keeping the same logic but calling closeModal after success)
  async function handleCustomerSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCustomer(editingId, customerForm);
      } else {
        await createCustomer(customerForm);
      }
      closeModal();
    } catch (error) {
      console.error('Error submitting customer:', error);
    }
  }

  async function createCustomer(customerData: Omit<Customer, 'id'>) {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/customer`;
    const res = await axios.post(url, customerData, { withCredentials: true });
    getMarketingCustomer();
    return res.data;
  }

  async function updateCustomer(
    id: number,
    customerData: Omit<Customer, 'id'>,
  ) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/marketing/customer/${id}`;
    const res = await axios.put(url, customerData, { withCredentials: true });
    getMarketingCustomer();
    return res.data;
  }

  // Similar pattern for other CRUD functions...
  async function handleProdukSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProduk(editingId, produkForm);
      } else {
        await createProduk(produkForm);
      }
      closeModal();
    } catch (error) {
      console.error('Error submitting produk:', error);
    }
  }

  async function createProduk(produkData: Omit<Produk, 'id'>) {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/produk`;
    const res = await axios.post(url, produkData, { withCredentials: true });
    getMarketingProduk();
    return res.data;
  }

  async function updateProduk(id: number, produkData: Omit<Produk, 'id'>) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/marketing/produk/${id}`;
    const res = await axios.put(url, produkData, { withCredentials: true });
    getMarketingProduk();
    return res.data;
  }

  async function handlePengirimanSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await updatePengiriman(editingId, pengirimanForm);
      } else {
        await createPengiriman(pengirimanForm);
      }
      closeModal();
    } catch (error) {
      console.error('Error submitting pengiriman:', error);
    }
  }

  async function createPengiriman(pengirimanData: Omit<Pengiriman, 'id'>) {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/pengiriman`;
    const res = await axios.post(url, pengirimanData, {
      withCredentials: true,
    });
    getMarketingPengiriman();
    return res.data;
  }

  async function updatePengiriman(
    id: number,
    pengirimanData: Omit<Pengiriman, 'id'>,
  ) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/marketing/pengiriman/${id}`;
    const res = await axios.put(url, pengirimanData, { withCredentials: true });
    getMarketingPengiriman();
    return res.data;
  }

  async function handleMarketingSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMarketing(editingId, marketingForm);
      } else {
        await createMarketing(marketingForm);
      }
      closeModal();
    } catch (error) {
      console.error('Error submitting marketing:', error);
    }
  }

  async function createMarketing(marketingData: Omit<Marketing, 'id'>) {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing`;
    const res = await axios.post(url, marketingData, { withCredentials: true });
    getMarketing();
    return res.data;
  }

  async function updateMarketing(
    id: number,
    marketingData: Omit<Marketing, 'id'>,
  ) {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/${id}`;
    const res = await axios.put(url, marketingData, { withCredentials: true });
    getMarketing();
    return res.data;
  }

  // Helper functions (keeping the same)
  const getKaryawanName = (id_karyawan: number) => {
    const karyawan = karyawans.find((k) => k.userid === id_karyawan);
    return karyawan ? karyawan.name : 'Unknown';
  };

  const getMarketingName = (id_marketing: number) => {
    const marketing = marketings.find((m) => m.id === id_marketing);
    if (marketing) {
      return `${marketing.kode} - ${getKaryawanName(marketing.id_karyawan)}`;
    }
    return 'Unknown';
  };

  const getProdukName = (id_produk: number) => {
    const produk = produks.find((p) => p.id === id_produk);
    return produk ? `${produk.kode} - ${produk.nama_produk}` : 'Unknown';
  };

  // Helper functions to prepare options for SearchableSelect
  const getMarketingOptions = () => {
    return marketings.map((marketing) => ({
      value: marketing.id || 0,
      label: `${marketing.kode} - ${getKaryawanName(marketing.id_karyawan)}`,
    }));
  };

  const getProdukOptions = () => {
    return produks.map((produk) => ({
      value: produk.id || 0,
      label: `${produk.kode} - ${produk.nama_produk}`,
    }));
  };

  const getPengirimanOptions = () => {
    return pengirimans.map((pengiriman) => ({
      value: pengiriman.id || 0,
      label: `${
        pengiriman.nama_area
      } - Rp ${pengiriman.harga.toLocaleString()}`,
    }));
  };

  const getKaryawanOptions = () => {
    return karyawans.map((karyawan) => ({
      value: karyawan.userid,
      label: karyawan.name,
    }));
  };

  return (
    <div className="min-w-[700px] mx-auto grid grid-cols-2 gap-x-2 text-xs">
      {/* Customer Section */}
      <div className="mb-2 bg-white rounded-lg shadow overflow-hidden col-span-2">
        <div className="flex justify-between items-center p-2 ">
          <h2 className="text-sm font-semibold">Customer List</h2>
          <button
            onClick={() => openModal('customer')}
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs"
          >
            + Customer
          </button>
        </div>

        {/* Search Section */}
        <div className="p-2 ">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Search customers..."
              value={searches.customers}
              onChange={(e) =>
                setSearches((prev) => ({ ...prev, customers: e.target.value }))
              }
              className=" border rounded px-2 py-1 text-xs"
            />
            <button
              onClick={() => handleSearch('customers')}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
            >
              Search
            </button>
            <button
              onClick={() => handleResetSearch('customers')}
              className="bg-gray-500 text-red-500  px-3 py-1 rounded hover:bg-gray-600 text-xs"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No.
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marketing
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produk
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telepon
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer, index) => (
                <tr key={customer.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                    <button
                      onClick={() => openModal('customer', customer)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      Edit
                    </button>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                    {customer.nama_customer}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {customer.email}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {getMarketingName(customer.id_marketing)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {getProdukName(customer.id_produk)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {customer.telepon}
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
              color="primary"
              size="small"
              onChange={(e, i) => {
                setPage(i);
              }}
            />
          </Stack>
        </div>
      </div>

      {/* Produk Section */}
      <div className="mb-2 bg-white rounded-lg shadow overflow-hidden col-span-2">
        <div className="flex justify-between items-center p-2 ">
          <h2 className="text-sm font-semibold">Produk List</h2>
          <button
            onClick={() => openModal('produk')}
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs"
          >
            + Produk
          </button>
        </div>

        {/* Search Section */}
        <div className="p-2 ">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Search produk..."
              value={searches.produks}
              onChange={(e) =>
                setSearches((prev) => ({ ...prev, produks: e.target.value }))
              }
              className="border rounded px-2 py-1 text-xs"
            />
            <button
              onClick={() => handleSearch('produks')}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
            >
              Search
            </button>
            <button
              onClick={() => handleResetSearch('produks')}
              className="bg-gray-500 text-red-500  px-3 py-1 rounded hover:bg-gray-600 text-xs"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No.
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kode
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Produk
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keterangan
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {produks.map((produk, index) => (
                <tr key={produk.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                    <button
                      onClick={() => openModal('produk', produk)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      Edit
                    </button>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                    {produk.kode}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {produk.nama_produk}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-500">
                    {produk.keterangan}
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
              color="primary"
              size="small"
              onChange={(e, i) => {
                setPage(i);
              }}
            />
          </Stack>
        </div>
      </div>

      {/* Pengiriman Section */}
      <div className="mb-6 bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-2 ">
          <h2 className="text-sm font-semibold">Pengiriman List</h2>
          <button
            onClick={() => openModal('pengiriman')}
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs"
          >
            + Pengiriman
          </button>
        </div>

        {/* Search Section */}
        <div className="p-2 ">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Search pengiriman..."
              value={searches.pengirimans}
              onChange={(e) =>
                setSearches((prev) => ({
                  ...prev,
                  pengirimans: e.target.value,
                }))
              }
              className=" border rounded px-2 py-1 text-xs"
            />
            <button
              onClick={() => handleSearch('pengirimans')}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
            >
              Search
            </button>
            <button
              onClick={() => handleResetSearch('pengirimans')}
              className="bg-gray-500 text-red-500  px-3 py-1 rounded hover:bg-gray-600 text-xs"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No.
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Area
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pengirimans.map((pengiriman, index) => (
                <tr key={pengiriman.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                    <button
                      onClick={() => openModal('pengiriman', pengiriman)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      Edit
                    </button>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                    {pengiriman.nama_area}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    Rp {pengiriman.harga.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="w-full flex justify-center mt-3 pb-2">
          <Stack spacing={2}>
            <Pagination
              count={totalPages.pengirimans}
              color="primary"
              size="small"
              onChange={(e, i) => {
                setPage(i);
              }}
            />
          </Stack>
        </div>
      </div>

      {/* Marketing Section */}
      <div className="mb-6 bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-2 ">
          <h2 className="text-sm font-semibold">Marketing List</h2>
          <button
            onClick={() => openModal('marketing')}
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs"
          >
            + Marketing
          </button>
        </div>

        {/* Search Section */}
        <div className="p-2 ">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Search Kode Marketing..."
              value={searches.marketings}
              onChange={(e) =>
                setSearches((prev) => ({ ...prev, marketings: e.target.value }))
              }
              className="flex border rounded px-2 py-1 text-xs"
            />
            <button
              onClick={() => handleSearch('marketings')}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
            >
              Search
            </button>
            <button
              onClick={() => handleResetSearch('marketings')}
              className="bg-gray-500 text-red-500 px-3 py-1 rounded hover:bg-gray-600 text-xs"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No.
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kode
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Karyawan
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {marketings.map((marketing, index) => (
                <tr key={marketing.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                    <button
                      onClick={() => openModal('marketing', marketing)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      Edit
                    </button>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                    {marketing.kode}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {getKaryawanName(marketing.id_karyawan)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="w-full flex justify-center mt-3 pb-2">
          <Stack spacing={2}>
            <Pagination
              count={totalPages.marketings}
              color="primary"
              size="small"
              onChange={(e, i) => {
                setPage(i);
              }}
            />
          </Stack>
        </div>
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold">
                {editingId ? 'Edit' : 'Add'}{' '}
                {activeModal.charAt(0).toUpperCase() + activeModal.slice(1)}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Customer Modal Form */}
            {activeModal === 'customer' && (
              <form
                onSubmit={handleCustomerSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Marketing
                  </label>
                  <SearchableSelect
                    options={getMarketingOptions()}
                    value={customerForm.id_marketing}
                    onChange={(value) =>
                      setCustomerForm({
                        ...customerForm,
                        id_marketing: value,
                      })
                    }
                    placeholder="Select Marketing"
                    className=""
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Produk
                  </label>
                  <SearchableSelect
                    options={getProdukOptions()}
                    value={customerForm.id_produk}
                    onChange={(value) =>
                      setCustomerForm({
                        ...customerForm,
                        id_produk: value,
                      })
                    }
                    placeholder="Select Produk"
                    className=""
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Pengiriman
                  </label>
                  <SearchableSelect
                    options={getPengirimanOptions()}
                    value={customerForm.id_harga_pengiriman}
                    onChange={(value) =>
                      setCustomerForm({
                        ...customerForm,
                        id_harga_pengiriman: value,
                      })
                    }
                    placeholder="Select Pengiriman"
                    className=""
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Nama Customer
                  </label>
                  <input
                    type="text"
                    value={customerForm.nama_customer}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        nama_customer: e.target.value,
                      })
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        email: e.target.value,
                      })
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Alamat Kantor
                  </label>
                  <input
                    type="text"
                    value={customerForm.alamat_kantor}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        alamat_kantor: e.target.value,
                      })
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Alamat Gudang
                  </label>
                  <input
                    type="text"
                    value={customerForm.alamat_gudang}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        alamat_gudang: e.target.value,
                      })
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Telepon
                  </label>
                  <input
                    type="text"
                    value={customerForm.telepon}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        telepon: e.target.value,
                      })
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Toleransi Pengiriman
                  </label>
                  <input
                    type="text"
                    value={customerForm.toleransi_pengiriman}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        toleransi_pengiriman: e.target.value,
                      })
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    TOP Faktur (hari)
                  </label>
                  <input
                    type="number"
                    value={customerForm.top_faktur}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        top_faktur: parseInt(e.target.value),
                      })
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end space-x-2 mt-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
                  >
                    {editingId ? 'Update' : 'Create'} Customer
                  </button>
                </div>
              </form>
            )}

            {/* Produk Modal Form */}
            {activeModal === 'produk' && (
              <form onSubmit={handleProdukSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Kode</label>
                  <input
                    type="text"
                    value={produkForm.kode}
                    onChange={(e) =>
                      setProdukForm({ ...produkForm, kode: e.target.value })
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Nama Produk
                  </label>
                  <input
                    type="text"
                    value={produkForm.nama_produk}
                    onChange={(e) =>
                      setProdukForm({
                        ...produkForm,
                        nama_produk: e.target.value,
                      })
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Keterangan
                  </label>
                  <textarea
                    value={produkForm.keterangan}
                    onChange={(e) =>
                      setProdukForm({
                        ...produkForm,
                        keterangan: e.target.value,
                      })
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2 mt-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
                  >
                    {editingId ? 'Update' : 'Create'} Produk
                  </button>
                </div>
              </form>
            )}

            {/* Pengiriman Modal Form */}
            {activeModal === 'pengiriman' && (
              <form onSubmit={handlePengirimanSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Nama Area
                  </label>
                  <input
                    type="text"
                    value={pengirimanForm.nama_area}
                    onChange={(e) =>
                      setPengirimanForm({
                        ...pengirimanForm,
                        nama_area: e.target.value,
                      })
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Harga
                  </label>
                  <input
                    type="number"
                    value={pengirimanForm.harga}
                    onChange={(e) =>
                      setPengirimanForm({
                        ...pengirimanForm,
                        harga: parseInt(e.target.value),
                      })
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                  />
                </div>

                <div className="flex justify-end space-x-2 mt-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
                  >
                    {editingId ? 'Update' : 'Create'} Pengiriman
                  </button>
                </div>
              </form>
            )}

            {/* Marketing Modal Form */}
            {activeModal === 'marketing' && (
              <form onSubmit={handleMarketingSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Kode</label>
                  <input
                    type="text"
                    value={marketingForm.kode}
                    onChange={(e) =>
                      setMarketingForm({
                        ...marketingForm,
                        kode: e.target.value,
                      })
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Karyawan
                  </label>
                  <SearchableSelect
                    options={getKaryawanOptions()}
                    value={marketingForm.id_karyawan}
                    onChange={(value) =>
                      setMarketingForm({
                        ...marketingForm,
                        id_karyawan: value,
                      })
                    }
                    placeholder="Select Karyawan"
                    className=""
                  />
                </div>

                <div className="flex justify-end space-x-2 mt-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
                  >
                    {editingId ? 'Update' : 'Create'} Marketing
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDataKalkulasi;
