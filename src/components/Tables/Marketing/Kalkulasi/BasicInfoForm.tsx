import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { KalkulasiFormData } from './KalkulasiModal';
import SearchableSelect from '../../../../pages/MasterData/Marketing/SearchableSelect';

interface BasicInfoFormProps {
  formData: KalkulasiFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
}

interface Customer {
  id: number;
  nama_customer: string;
  id_marketing: number;
  id_harga_pengiriman: number;
}

interface Marketing {
  id: number;
  nama_marketing: string;
  kode: string;
  data_karyawan?: {
    name: string;
  };
}

interface Product {
  id: number;
  nama_produk: string;
}

interface Pengiriman {
  id: number;
  nama_area: string;
  harga: number;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  formData,
  onInputChange,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [marketingList, setMarketingList] = useState<Marketing[]>([]);
  const [produks, setProduks] = useState<Product[]>([]);
  const [pengirimans, setPengirimans] = useState<Pengiriman[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  useEffect(() => {
    getMarketingCustomer();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      getMarketingList(selectedCustomer.id_marketing);
      getMarketingPengiriman(selectedCustomer.id_harga_pengiriman);
      getProduks(selectedCustomer.id);
    } else {
      setMarketingList([]);
      setProduks([]);
      setPengirimans([]);
    }
  }, [selectedCustomer]);

  // Helper function to ensure array format
  const ensureArray = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return [data];
  };

  async function getMarketingCustomer() {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/customer`;
    try {
      setLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      console.log('Fetched customers:', res.data);

      // Handle different response structures
      let customerData = [];
      if (res.data?.data) {
        customerData = ensureArray(res.data.data);
      } else if (Array.isArray(res.data)) {
        customerData = res.data;
      } else if (res.data) {
        customerData = ensureArray(res.data);
      }

      setCustomers(customerData);
    } catch (error: any) {
      console.log('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  async function getMarketingList(marketingId?: any) {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing${
      marketingId ? `/${marketingId}` : ''
    }`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });
      console.log('Fetched marketing list:', res.data);

      // Handle different response structures
      let marketingData = [];
      if (res.data?.data) {
        marketingData = ensureArray(res.data.data);
      } else if (Array.isArray(res.data)) {
        marketingData = res.data;
      } else if (res.data) {
        marketingData = ensureArray(res.data);
      }

      setMarketingList(marketingData);
    } catch (error: any) {
      console.log('Error fetching marketing:', error);
      setMarketingList([]);
    }
  }

  async function getMarketingPengiriman(pengirimanId?: any) {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/pengiriman${
      pengirimanId ? `/${pengirimanId}` : ''
    }`;
    try {
      setLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      console.log('Fetched pengiriman data:', res.data);

      // Handle different response structures
      let pengirimanData = [];
      if (res.data?.data) {
        pengirimanData = ensureArray(res.data.data);
      } else if (Array.isArray(res.data)) {
        pengirimanData = res.data;
      } else if (res.data) {
        pengirimanData = ensureArray(res.data);
      }

      setPengirimans(pengirimanData);
    } catch (error: any) {
      console.log('Error fetching pengiriman:', error);
      setPengirimans([]);
    } finally {
      setLoading(false);
    }
  }

  async function getProduks(customerId?: any) {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/produk${
      customerId ? `?id_customer=${customerId}` : ''
    }`;
    try {
      setLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      console.log('Fetched produks:', res.data);

      // Handle different response structures
      let produktData = [];
      if (res.data?.data) {
        produktData = ensureArray(res.data.data);
      } else if (Array.isArray(res.data)) {
        produktData = res.data;
      } else if (res.data) {
        produktData = ensureArray(res.data);
      }

      setProduks(produktData);
    } catch (error: any) {
      console.log('Error fetching produks:', error);
      setProduks([]);
    } finally {
      setLoading(false);
    }
  }

  // Handle customer selection
  const handleCustomerChange = (value: any) => {
    const customer = customers.find((c) => c.id === value);
    setSelectedCustomer(customer || null);

    onInputChange({
      target: { name: 'nama_customer', value: customer?.nama_customer || '' },
    } as React.ChangeEvent<HTMLSelectElement>);

    // Clear dependent fields when customer changes
    ['nama_marketing', 'nama_produk', 'nama_area_pengiriman'].forEach(
      (field) => {
        onInputChange({
          target: { name: field, value: '' },
        } as React.ChangeEvent<HTMLSelectElement>);
      },
    );
  };

  // Handle marketing selection
  const handleMarketingChange = (value: any) => {
    const marketing = marketingList.find((m) => m.id === value);
    const marketingName =
      marketing?.nama_marketing || marketing?.data_karyawan?.name || '';

    onInputChange({
      target: {
        name: 'nama_marketing',
        value: marketingName,
      },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  // Handle product selection
  const handleProductChange = (value: any) => {
    const product = produks.find((p) => p.id === value);
    onInputChange({
      target: { name: 'nama_produk', value: product?.nama_produk || '' },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  // Handle pengiriman selection
  const handlePengirimanChange = (value: any) => {
    const pengiriman = pengirimans.find((p) => p.id === value);
    onInputChange({
      target: {
        name: 'nama_area_pengiriman',
        value: pengiriman?.nama_area || '',
      },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  // Get selected values for controlled components
  const getSelectedCustomerId = () => {
    const customer = customers.find(
      (c) => c.nama_customer === formData.nama_customer,
    );
    return customer ? customer.id : 0;
  };

  const getSelectedMarketingId = () => {
    const marketing = marketingList.find(
      (m) =>
        m.nama_marketing === formData.nama_marketing ||
        m.data_karyawan?.name === formData.nama_marketing,
    );
    return marketing ? marketing.id : 0;
  };

  const getSelectedProductId = () => {
    const product = produks.find((p) => p.nama_produk === formData.nama_produk);
    return product ? product.id : 0;
  };

  const getSelectedPengirimanId = () => {
    // Use nama_area_pengiriman as it's the actual field in formData
    const pengiriman = pengirimans.find(
      (p) => p.nama_area === formData.nama_area_pengiriman,
    );
    return pengiriman ? pengiriman.id : 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xs font-semibold text-gray-800 mb-6 flex items-center">
        <svg
          className="w-5 h-5 mr-2 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Informasi Dasar
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Tanggal Kalkulasi
          </label>
          <input
            type="date"
            name="tgl_kalkulasi"
            value={formData.tgl_kalkulasi}
            onChange={onInputChange}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Status
          </label>
          <select
            name="status_kalkulasi"
            value={formData.status_kalkulasi}
            onChange={onInputChange}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="Baru">Baru</option>
            <option value="Draft">Draft</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Customer
          </label>
          <SearchableSelect
            options={[
              { value: 0, label: 'Pilih Customer' },
              ...customers.map((customer) => ({
                value: customer.id,
                label: customer.nama_customer,
              })),
            ]}
            value={getSelectedCustomerId()}
            onChange={handleCustomerChange}
            placeholder="Pilih Customer"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Marketing
          </label>
          <SearchableSelect
            options={[
              { value: 0, label: 'Pilih Marketing' },
              ...marketingList.map((marketing: any) => ({
                value: marketing.id,
                label: `${marketing.kode} - ${
                  marketing.data_karyawan?.name ||
                  marketing.nama_marketing ||
                  'Unknown'
                }`,
              })),
            ]}
            value={getSelectedMarketingId()}
            onChange={handleMarketingChange}
            placeholder="Pilih Marketing"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Produk
          </label>
          <SearchableSelect
            options={[
              { value: 0, label: 'Pilih Produk' },
              ...produks.map((produk) => ({
                value: produk.id,
                label: produk.nama_produk,
              })),
            ]}
            value={getSelectedProductId()}
            onChange={handleProductChange}
            placeholder="Pilih Produk"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Area Pengiriman
          </label>
          <SearchableSelect
            options={[
              { value: 0, label: 'Pilih Area Pengiriman' },
              ...pengirimans.map((pengiriman) => ({
                value: pengiriman.id,
                label: `${pengiriman.nama_area} +  ${new Intl.NumberFormat(
                  'id-ID',
                  {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  },
                ).format(pengiriman.harga)}`,
              })),
            ]}
            value={getSelectedPengirimanId()}
            onChange={handlePengirimanChange}
            placeholder="Pilih Area Pengiriman"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">Qty</label>
          <input
            type="number"
            name="qty_kalkulasi"
            value={formData.qty_kalkulasi}
            onChange={onInputChange}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
            min="0"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Presentase Insheet %
          </label>
          <input
            type="number"
            name="presentase_insheet"
            value={formData.presentase_insheet}
            onChange={onInputChange}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            min="0"
            max="100"
            step="0.01"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Spesifikasi
        </label>
        <textarea
          name="spesifikasi"
          value={formData.spesifikasi}
          onChange={onInputChange}
          rows={3}
          className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Masukkan spesifikasi produk..."
        />
      </div>
    </div>
  );
};

export default BasicInfoForm;
