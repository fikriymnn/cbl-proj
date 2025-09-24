import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { KalkulasiFormData } from '../Kalkulasi/types/kalkulasi';
import SearchableSelect from '../../../../pages/MasterData/Marketing/SearchableSelect';

interface BasicInfoFormProps {
  formData: KalkulasiFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  isReadOnly?: boolean; // Add this
  copyType?: 'repeat' | 'repeat_perubahan'; // Add this
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
  copyType,
  isReadOnly = false,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [marketingList, setMarketingList] = useState<Marketing[]>([]);
  const [produks, setProduks] = useState<Product[]>([]);
  const [pengirimans, setPengirimans] = useState<Pengiriman[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const isFieldDisabled = (fieldType: 'basic' | 'select') => {
    if (copyType === 'repeat') return true; // All fields disabled for repeat
    if (copyType === 'repeat_perubahan' && fieldType === 'basic') return false; // Basic fields editable for repeat_perubahan
    if (copyType === 'repeat_perubahan' && fieldType === 'select') return false; // Select fields editable for repeat_perubahan
    return isReadOnly;
  };
  useEffect(() => {
    getMarketingCustomer();
  }, []);

  // NEW: Sync selectedCustomer when formData changes (for editing existing data)
  useEffect(() => {
    if (formData.id_customer && customers.length > 0) {
      const customer = customers.find((c) => c.id === formData.id_customer);
      if (customer && customer !== selectedCustomer) {
        setSelectedCustomer(customer);
      }
    }
  }, [formData.id_customer, customers]);

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

  const handleCustomerChange = (value: any) => {
    if (isFieldDisabled('select')) return;

    const customer = customers.find((c) => c.id === value);
    setSelectedCustomer(customer || null);

    onInputChange({
      target: { name: 'id_customer', value: customer?.id || 0 },
    } as unknown as React.ChangeEvent<HTMLSelectElement>);

    onInputChange({
      target: { name: 'nama_customer', value: customer?.nama_customer || '' },
    } as unknown as React.ChangeEvent<HTMLSelectElement>);

    // Clear dependent fields when customer changes
    const fieldsToReset = [
      'id_marketing',
      'nama_marketing',
      'id_produk',
      'nama_produk',
      'id_area_pengiriman',
      'nama_area_pengiriman',
    ];

    fieldsToReset.forEach((field) => {
      onInputChange({
        target: { name: field, value: field.startsWith('id_') ? 0 : '' },
      } as React.ChangeEvent<HTMLSelectElement>);
    });
  };

  const handleMarketingChange = (value: any) => {
    if (isFieldDisabled('select')) return;

    const marketing = marketingList.find((m) => m.id === value);
    const marketingName =
      marketing?.nama_marketing || marketing?.data_karyawan?.name || '';

    onInputChange({
      target: { name: 'id_marketing', value: marketing?.id || 0 },
    } as unknown as React.ChangeEvent<HTMLSelectElement>);

    onInputChange({
      target: { name: 'nama_marketing', value: marketingName },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  const handleProductChange = (value: any) => {
    if (isFieldDisabled('select')) return;

    const product = produks.find((p) => p.id === value);

    onInputChange({
      target: { name: 'id_produk', value: product?.id || 0 },
    } as unknown as React.ChangeEvent<HTMLSelectElement>);

    onInputChange({
      target: { name: 'nama_produk', value: product?.nama_produk || '' },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  const handlePengirimanChange = (value: any) => {
    if (isFieldDisabled('select')) return;

    const pengiriman = pengirimans.find((p) => p.id === value);

    onInputChange({
      target: { name: 'id_area_pengiriman', value: pengiriman?.id || 0 },
    } as unknown as React.ChangeEvent<HTMLSelectElement>);

    onInputChange({
      target: {
        name: 'nama_area_pengiriman',
        value: pengiriman?.nama_area || '',
      },
    } as React.ChangeEvent<HTMLSelectElement>);

    onInputChange({
      target: {
        name: 'harga_pengiriman_awal',
        value: pengiriman?.harga || '',
      },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  // FIXED: Get selected values for controlled components
  const getSelectedCustomerId = () => {
    return formData.id_customer || 0;
  };

  const getSelectedMarketingId = () => {
    return formData.id_marketing || 0;
  };

  const getSelectedProductId = () => {
    return formData.id_produk || 0;
  };

  const getSelectedPengirimanId = () => {
    return formData.id_area_pengiriman || 0;
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
            className={`w-full px-2 py-1 border border-gray-300 rounded-lg transition-all ${
              isFieldDisabled('basic')
                ? 'bg-gray-100 cursor-not-allowed'
                : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            }`}
            disabled={isFieldDisabled('basic')}
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
            className={`w-full px-2 py-1 border border-gray-300 rounded-lg transition-all ${
              isFieldDisabled('basic')
                ? 'bg-gray-100 cursor-not-allowed'
                : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            }`}
            disabled={isFieldDisabled('basic')}
          >
            <option value="baru">Baru</option>
            <option value="repeat">Repeat</option>
            <option value="repeat perubahan">Repeat Perubahan</option>
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
            disabled={isFieldDisabled('select')}
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
            disabled={isFieldDisabled('select')}
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
            disabled={isFieldDisabled('select')}
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
                label: `${pengiriman.nama_area}`,
              })),
            ]}
            value={getSelectedPengirimanId()}
            onChange={handlePengirimanChange}
            placeholder="Pilih Area Pengiriman"
            disabled={isFieldDisabled('select')}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">Qty</label>
          <input
            type="number"
            name="qty_kalkulasi"
            value={formData.qty_kalkulasi}
            onChange={onInputChange}
            className={`w-full px-2 py-1 border border-gray-300 rounded-lg transition-all ${
              isFieldDisabled('basic')
                ? 'bg-gray-100 cursor-not-allowed'
                : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            }`}
            required
            min="0"
            disabled={isFieldDisabled('basic')}
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
            className={`w-full px-2 py-1 border border-gray-300 rounded-lg transition-all ${
              isFieldDisabled('basic')
                ? 'bg-gray-100 cursor-not-allowed'
                : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            }`}
            min="0"
            max="100"
            step="0.01"
            disabled={isFieldDisabled('basic')}
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
          className={`w-full px-2 py-1 border border-gray-300 rounded-lg transition-all ${
            isFieldDisabled('basic')
              ? 'bg-gray-100 cursor-not-allowed'
              : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          }`}
          placeholder="Masukkan spesifikasi produk..."
          disabled={isFieldDisabled('basic')}
        />
      </div>
    </div>
  );
};

export default BasicInfoForm;
