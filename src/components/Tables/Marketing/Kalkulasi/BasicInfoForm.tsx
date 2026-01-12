import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { KalkulasiFormData, QtyListItem } from '../Kalkulasi/types/kalkulasi';
import SearchableSelect from '../../../../pages/MasterData/Marketing/SearchableSelect';

interface BasicInfoFormProps {
  formData: KalkulasiFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onQtyListChange?: (newList: QtyListItem[]) => void;
  isReadOnly?: boolean;
  isEditMode?: boolean;
  copyType?: 'repeat' | 'repeat_perubahan';
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
  onQtyListChange,
  isReadOnly = false,
  isEditMode = false,
  copyType,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [marketingList, setMarketingList] = useState<Marketing[]>([]);
  const [produks, setProduks] = useState<Product[]>([]);
  const [pengirimans, setPengirimans] = useState<Pengiriman[]>([]);
  const [loading, setLoading] = useState(false);
  const [nomorKalkulasi, setNomorKalkulasi] = useState<string>('');

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const isFieldDisabled = (fieldName?: string) => {
    if (isReadOnly) return true;
    if (
      fieldName &&
      (copyType === 'repeat' || copyType === 'repeat_perubahan')
    ) {
      return isFieldDisabledForRepeat(fieldName);
    }
    return false;
  };

  // NEW: Helper to check if qty list operations are disabled
  const isQtyListDisabled = () => {
    // Only disabled if isReadOnly is true
    // In repeat modes, qty list should be editable
    return isReadOnly;
  };

  useEffect(() => {
    getMarketingCustomer();
    // Only generate new number if not in edit mode
    if (!isEditMode) {
      generateNomorKalkulasi();
    } else {
      // In edit mode, use existing kode_kalkulasi
      setNomorKalkulasi(formData.kode_kalkulasi || '');
    }
  }, [isEditMode]);

  // NEW: Load related data when formData is available in edit mode
  useEffect(() => {
    if (isEditMode && formData.id_customer && customers.length > 0) {
      const customer = customers.find((c) => c.id === formData.id_customer);
      if (customer) {
        setSelectedCustomer(customer);
        // Load marketing, products, and pengiriman for this customer
        getMarketingList(customer.id_marketing);
        getMarketingPengiriman(customer.id_harga_pengiriman);
        getProduks(customer.id);
      }
    }
  }, [isEditMode, formData.id_customer, customers]);

  useEffect(() => {
    if (formData.id_customer && customers.length > 0) {
      const customer = customers.find((c) => c.id === formData.id_customer);
      if (customer && customer !== selectedCustomer) {
        setSelectedCustomer(customer);
      }
    }
  }, [formData.id_customer, customers]);

  useEffect(() => {
    if (selectedCustomer && !isEditMode) {
      getMarketingList(selectedCustomer.id_marketing);
      getMarketingPengiriman(selectedCustomer.id_harga_pengiriman);
      getProduks(selectedCustomer.id);
    } else if (!selectedCustomer && !isEditMode) {
      setMarketingList([]);
      setProduks([]);
      setPengirimans([]);
    }
  }, [selectedCustomer, isEditMode]);

  const isFieldDisabledForRepeat = (fieldName: string) => {
    if (copyType !== 'repeat' && copyType !== 'repeat_perubahan') return false;

    // Fields that are editable in both repeat and repeat_perubahan modes
    const editableFields = [
      'qty_kalkulasi',
      'label',
      'presentase_insheet',
      'spesifikasi',
    ];
    return !editableFields.includes(fieldName);
  };

  async function generateNomorKalkulasi() {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/marketing/kalkulasiJumlahData`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      const totalData = res.data.total_data || 0;
      const nextNumber = totalData + 1;

      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);
      const formattedNumber = String(nextNumber).padStart(5, '0');

      const nomor = `KA-${formattedNumber}/${month}/${year}`;
      setNomorKalkulasi(nomor);

      onInputChange({
        target: { name: 'kode_kalkulasi', value: nomor },
      } as React.ChangeEvent<HTMLInputElement>);
    } catch (error: any) {
      console.log('Error generating nomor kalkulasi:', error);
      setNomorKalkulasi('KA-00001/01/25');
    }
  }

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
    if (isFieldDisabled()) return;

    const customer = customers.find((c) => c.id === value);
    setSelectedCustomer(customer || null);

    onInputChange({
      target: { name: 'id_customer', value: customer?.id || 0 },
    } as unknown as React.ChangeEvent<HTMLSelectElement>);

    onInputChange({
      target: { name: 'nama_customer', value: customer?.nama_customer || '' },
    } as unknown as React.ChangeEvent<HTMLSelectElement>);

    // Only reset fields if not in edit mode
    if (!isEditMode) {
      const fieldsToReset = [
        'id_marketing',
        'nama_marketing',
        'id_produk',
        'nama_produk',
        'id_area_pengiriman',
        'nama_area_pengiriman',
        'harga_pengiriman_awal',
      ];

      fieldsToReset.forEach((field) => {
        onInputChange({
          target: {
            name: field,
            value:
              field.startsWith('id_') || field.startsWith('harga_') ? 0 : '',
          },
        } as React.ChangeEvent<HTMLSelectElement>);
      });
    }
  };
  const handleHargaSatuanCustomerChange = (index: number, value: number) => {
    if (onQtyListChange && !isQtyListDisabled()) {
      const newList = (formData.qty_list || []).map((item, i) =>
        i === index ? { ...item, harga_satuan_customer: value } : item,
      );
      onQtyListChange(newList);
    }
  };
  const handleMarketingChange = (value: any) => {
    if (isFieldDisabled()) return;

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
    if (isFieldDisabled()) return;

    const product = produks.find((p) => p.id === value);

    onInputChange({
      target: { name: 'id_produk', value: product?.id || 0 },
    } as unknown as React.ChangeEvent<HTMLSelectElement>);

    onInputChange({
      target: { name: 'nama_produk', value: product?.nama_produk || '' },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  const handlePengirimanChange = (value: any) => {
    if (isFieldDisabled()) return;

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

    // Store the base harga pengiriman for calculation
    onInputChange({
      target: {
        name: 'harga_pengiriman_awal',
        value: pengiriman?.harga?.toString() || '0',
      },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  // UPDATED: Use isQtyListDisabled instead of isReadOnly
  const handleAddQty = () => {
    if (onQtyListChange && !isQtyListDisabled()) {
      const newList = [
        ...(formData.qty_list || []),
        { qty: 0, is_selected: false },
      ];
      onQtyListChange(newList);
    }
  };

  // UPDATED: Use isQtyListDisabled instead of isReadOnly
  const handleRemoveQty = (index: number) => {
    if (onQtyListChange && !isQtyListDisabled()) {
      const newList = (formData.qty_list || []).filter((_, i) => i !== index);
      onQtyListChange(newList);
    }
  };

  // UPDATED: Use isQtyListDisabled instead of isReadOnly
  const handleQtyChange = (index: number, value: number) => {
    if (onQtyListChange && !isQtyListDisabled()) {
      const newList = (formData.qty_list || []).map((item, i) =>
        i === index ? { ...item, qty: value } : item,
      );
      onQtyListChange(newList);
    }
  };

  // UPDATED: Use isQtyListDisabled instead of isReadOnly
  const handleSelectQty = (index: number) => {
    if (onQtyListChange && !isQtyListDisabled()) {
      const newList = (formData.qty_list || []).map((item, i) => ({
        ...item,
        is_selected: i === index,
      }));
      onQtyListChange(newList);
    }
  };

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

  useEffect(() => {
    if (isEditMode && formData.id_customer && customers.length > 0) {
      const customer = customers.find((c) => c.id === formData.id_customer);
      if (customer) {
        setSelectedCustomer(customer);
        // Load marketing, products, and pengiriman for this customer
        getMarketingList(customer.id_marketing);
        getMarketingPengiriman(customer.id_harga_pengiriman);
        getProduks(customer.id);
      }
    }
  }, [isEditMode, formData.id_customer, customers]);

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
        {/* Nomor Kalkulasi - Always disabled */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Nomor Kalkulasi
          </label>
          <input
            type="text"
            name="kode_kalkulasi"
            value={nomorKalkulasi || formData.kode_kalkulasi || ''}
            className="w-full px-2 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed text-xs"
            disabled
            readOnly
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Tanggal Kalkulasi
          </label>
          <input
            type="date"
            name="tgl_kalkulasi"
            value={formData.tgl_kalkulasi}
            onChange={onInputChange}
            className={`w-full px-2 py-2 text-xs border border-gray-300 rounded-lg transition-all ${
              isFieldDisabled('tgl_kalkulasi')
                ? 'bg-gray-100 cursor-not-allowed'
                : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            }`}
            disabled={isFieldDisabled('tgl_kalkulasi')}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Status
          </label>
          <input
            type="text"
            name="status_kalkulasi"
            value={formData.status_kalkulasi}
            onChange={onInputChange}
            className={`w-full px-2 py-2 text-xs border border-gray-300 rounded-lg transition-all ${
              isFieldDisabled('status_kalkulasi')
                ? 'bg-gray-100 cursor-not-allowed'
                : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            }`}
            disabled
          ></input>
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
            disabled={isFieldDisabled('id_customer')}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
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
            disabled={isFieldDisabled('id_marketing')}
          />
        </div>

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
                label: `${pengiriman.nama_area}`,
              })),
            ]}
            value={getSelectedPengirimanId()}
            onChange={handlePengirimanChange}
            placeholder="Pilih Area Pengiriman"
            disabled={isFieldDisabled('id_area_pengiriman')}
          />
        </div>

        {/* Qty - NOW EDITABLE in both repeat modes */}
        {formData.tipe_kalkulasi !== 'multi' ? (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Qty
            </label>
            <input
              type="number"
              name="qty_kalkulasi"
              value={formData.qty_kalkulasi}
              onChange={onInputChange}
              className={`w-full px-2 py-2 text-xs border border-gray-300 rounded-lg transition-all ${
                isFieldDisabled('qty_kalkulasi')
                  ? 'bg-gray-100 cursor-not-allowed'
                  : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }`}
              required
              min="0"
              disabled={isFieldDisabled('qty_kalkulasi')}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Qty (Auto)
            </label>
            <input
              type="number"
              name="qty_kalkulasi"
              value={formData.qty_kalkulasi}
              className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              disabled
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              * Otomatis dari pilihan qty
            </p>
          </div>
        )}
      </div>
      {/* Label - NOW EDITABLE in both repeat modes */}
      {formData.tipe_kalkulasi === 'multi' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Label <span className="text-red-500">*</span>
            </label>
            <select
              name="label"
              value={formData.label || ''}
              onChange={onInputChange}
              className={`w-full px-2 py-2 text-xs border border-gray-300 rounded-lg transition-all ${
                isFieldDisabled('label')
                  ? 'bg-gray-100 cursor-not-allowed'
                  : 'focus:ring-2 focus:ring-green-500 focus:border-transparent'
              }`}
              required
              disabled={isFieldDisabled('label')}
            >
              <option value="">Pilih Label</option>
              <option value="CARTONING">CARTONING</option>
              <option value="NON CARTONING">NON CARTONING</option>
            </select>
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
              className={`w-full px-2 py-2 text-xs border border-gray-300 rounded-lg transition-all ${
                isFieldDisabled('presentase_insheet')
                  ? 'bg-gray-100 cursor-not-allowed'
                  : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }`}
              min="0"
              max="100"
              step="0.01"
              disabled={isFieldDisabled('presentase_insheet')}
            />
          </div>
        </div>
      )}

      {formData.tipe_kalkulasi === 'multi' && (
        <div className="mt-6 border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-xs font-semibold text-gray-800">
              Daftar Quantity & Harga Customer{' '}
              <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleAddQty}
              disabled={isQtyListDisabled()}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50 transition-colors"
            >
              + Tambah
            </button>
          </div>

          {/* Responsive Grid: 1 column on mobile, 2 on tablet, 3 on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(formData.qty_list || []).map((item, index) => (
              <div
                key={index}
                className={`relative p-4 border-2 rounded-lg transition-all ${
                  item.is_selected
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {/* Radio Button - Top Right Corner */}
                <div className="absolute top-3 right-3">
                  <input
                    type="radio"
                    name="selected_qty"
                    checked={item.is_selected}
                    onChange={() => handleSelectQty(index)}
                    disabled={isQtyListDisabled()}
                    className="w-5 h-5 text-green-600 cursor-pointer"
                    title="Pilih quantity ini"
                  />
                </div>

                {/* Delete Button - Top Left Corner (if more than 1 item) */}
                {(formData.qty_list || []).length > 1 &&
                  !isQtyListDisabled() && (
                    <div className="absolute top-3 left-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveQty(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Hapus"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                {/* Content with top margin to avoid overlap with buttons */}
                <div className="space-y-3 mt-6">
                  {/* Qty Input */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        handleQtyChange(index, Number(e.target.value))
                      }
                      disabled={isQtyListDisabled()}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Masukkan quantity"
                      min="0"
                      required
                    />
                  </div>

                  {/* Harga Satuan Customer Input - Below Qty */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Harga Satuan Customer{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-600">
                        Rp
                      </span>
                      <input
                        type="number"
                        value={item.harga_satuan_customer || 0}
                        onChange={(e) =>
                          handleHargaSatuanCustomerChange(
                            index,
                            Number(e.target.value),
                          )
                        }
                        disabled={isQtyListDisabled()}
                        className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="0"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Per pcs</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-3">
            <span className="font-semibold">Petunjuk:</span> Klik radio button
            di pojok kanan atas untuk memilih quantity yang akan digunakan dalam
            kalkulasi
          </p>
        </div>
      )}
      {/* Non-multi label section - NOW EDITABLE in both repeat modes */}
      {formData.tipe_kalkulasi !== 'multi' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Label <span className="text-red-500">*</span>
            </label>
            <select
              name="label"
              value={formData.label || ''}
              onChange={onInputChange}
              className={`w-full px-2 py-2 text-xs border border-gray-300 rounded-lg transition-all ${
                isFieldDisabled('label')
                  ? 'bg-gray-100 cursor-not-allowed'
                  : 'focus:ring-2 focus:ring-green-500 focus:border-transparent'
              }`}
              required
              disabled={isFieldDisabled('label')}
            >
              <option value="">Pilih Label</option>
              <option value="CARTONING">CARTONING</option>
              <option value="NON CARTONING">NON CARTONING</option>
            </select>
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
              className={`w-full px-2 py-2 text-xs border border-gray-300 rounded-lg transition-all ${
                isFieldDisabled('presentase_insheet')
                  ? 'bg-gray-100 cursor-not-allowed'
                  : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }`}
              min="0"
              max="100"
              step="0.01"
              disabled={isFieldDisabled('presentase_insheet')}
            />
          </div>
        </div>
      )}
      {/* Spesifikasi - NOW EDITABLE in both repeat modes */}
      <div className="mt-6">
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Spesifikasi
        </label>
        <textarea
          name="spesifikasi"
          value={formData.spesifikasi}
          onChange={onInputChange}
          rows={3}
          className={`w-full px-2 py-1 text-xs border border-gray-300 rounded-lg transition-all ${
            isFieldDisabled('spesifikasi')
              ? 'bg-gray-100 cursor-not-allowed'
              : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          }`}
          placeholder="Masukkan spesifikasi produk..."
          disabled={isFieldDisabled('spesifikasi')}
        />
      </div>
    </div>
  );
};
export default BasicInfoForm;
