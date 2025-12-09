import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';

interface Customer {
  id: number;
  nama_customer: string;
  id_marketing: number;
  id_harga_pengiriman: number;
  alamat_kantor?: string;
  kontak_person?: string;
  telepon?: string;
}

interface DepositFormProps {
  depositId?: number;
  isEditMode?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface DepositFormData {
  id_customer: number | null;
  no_deposit: string;
  cara_bayar: string;
  keterangan: string;
  billing_address: string;
  tgl_faktur: string;
  nominal: number;
  note: string;
}

interface SearchableSelectProps {
  options: { value: string | number; label: string }[];
  value: { value: string | number; label: string } | null;
  onChange: (
    selected: { value: string | number; label: string } | null,
  ) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFilteredOptions(
      options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [searchTerm, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: { value: string | number; label: string }) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`w-full px-4 py-2.5 border rounded-lg flex items-center justify-between cursor-pointer transition-all ${
          disabled
            ? 'bg-gray-100 cursor-not-allowed'
            : 'bg-white hover:border-blue-500'
        } ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
        }`}
        onClick={handleToggle}
      >
        <div className="flex-1 flex items-center">
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full outline-none bg-transparent"
              placeholder="Type to search..."
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={value ? 'text-gray-900' : 'text-gray-400'}>
              {value ? value.label : placeholder}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
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
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No options found
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`px-4 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors ${
                  value?.value === option.value
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700'
                }`}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const DepositForm: React.FC<DepositFormProps> = ({
  depositId,
  isEditMode = false,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    value: number;
    label: string;
  } | null>(null);
  const [formData, setFormData] = useState<DepositFormData>({
    id_customer: null,
    no_deposit: '',
    cara_bayar: '',
    keterangan: '',
    billing_address: '',
    tgl_faktur: '',
    nominal: 0,
    note: '',
  });

  // Add state for formatted nominal display
  const [nominalDisplay, setNominalDisplay] = useState<string>('');

  const paymentMethods = [
    { value: 'TUNAI', label: 'Tunai' },
    { value: 'TRANSFER', label: 'Transfer' },
    { value: 'GIRO', label: 'Giro' },
    { value: 'CEK', label: 'Cek' },
  ];

  const keteranganOptions = [
    { value: 'BCA', label: 'BCA' },
    { value: 'MANDIRI', label: 'Mandiri' },
    { value: 'BNI', label: 'BNI' },
    { value: 'BRI', label: 'BRI' },
    { value: 'LAINNYA', label: 'Lainnya' },
  ];

  useEffect(() => {
    fetchCustomers();
    if (isEditMode && depositId) {
      fetchDepositDetail();
    } else {
      fetchDepositNumber();
    }
  }, [isEditMode, depositId]);

  const ensureArray = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') return [data];
    return [];
  };

  // Helper functions for number formatting
  const formatNumber = (value: number): string => {
    if (value === 0) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseFormattedNumber = (value: string): number => {
    const cleaned = value.replace(/\./g, '');
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const fetchCustomers = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/customer`;
    try {
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
    }
  };

  const fetchDepositNumber = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/depositNomor`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });
      console.log('Fetched deposit number:', res.data);

      if (res.data?.new_no_deposit) {
        setFormData((prev) => ({
          ...prev,
          no_deposit: res.data.new_no_deposit,
        }));
      }
    } catch (error) {
      console.error('Error fetching deposit number:', error);
    }
  };

  const fetchDepositDetail = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/deposit/${depositId}`;
    try {
      setLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });

      const data = res.data.data;

      setFormData({
        id_customer: data.id_customer,
        no_deposit: data.no_deposit,
        cara_bayar: data.cara_bayar || '',
        keterangan: data.keterangan || '',
        billing_address: data.billing_address || '',
        tgl_faktur: data.tgl_faktur ? formatDateForInput(data.tgl_faktur) : '',
        nominal: data.nominal || 0,
        note: data.note || '',
      });

      // Set formatted nominal display
      setNominalDisplay(formatNumber(data.nominal || 0));

      // Set selected customer for dropdown
      if (data.customer) {
        setSelectedCustomer({
          value: data.customer.id,
          label: data.customer.nama_customer,
        });
      }
    } catch (error) {
      console.error('Error fetching deposit detail:', error);
      alert('Failed to fetch deposit details');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleCustomerSelect = (
    selected: { value: string | number; label: string } | null,
  ) => {
    if (selected) {
      const typedSelected = {
        value: Number(selected.value),
        label: selected.label,
      };
      setSelectedCustomer(typedSelected);
      setFormData((prev) => ({
        ...prev,
        id_customer: typedSelected.value,
      }));

      // Auto-fill billing address if customer has address
      const customer = customers.find((c) => c.id === typedSelected.value);
      if (customer && customer.alamat_kantor) {
        setFormData((prev) => ({
          ...prev,
          billing_address: customer.alamat_kantor || '',
        }));
      }
    } else {
      setSelectedCustomer(null);
      setFormData((prev) => ({
        ...prev,
        id_customer: null,
        billing_address: '',
      }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === 'nominal') {
      // Remove all non-digit characters
      const numericValue = value.replace(/\D/g, '');
      const parsedValue = numericValue === '' ? 0 : parseInt(numericValue, 10);

      // Update the actual form data with number
      setFormData((prev) => ({
        ...prev,
        nominal: parsedValue,
      }));

      // Update the display with formatted value
      setNominalDisplay(formatNumber(parsedValue));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (
    selected: { value: string | number; label: string } | null,
    fieldName: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: selected ? selected.value : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.id_customer) {
      alert('Please select a customer');
      return;
    }
    if (!formData.cara_bayar) {
      alert('Please select payment method');
      return;
    }
    if (!formData.tgl_faktur) {
      alert('Please select invoice date');
      return;
    }
    if (formData.nominal <= 0) {
      alert('Please enter a valid nominal amount');
      return;
    }

    const url = isEditMode
      ? `${import.meta.env.VITE_API_LINK}/deposit/${depositId}`
      : `${import.meta.env.VITE_API_LINK}/deposit`;

    const method = isEditMode ? 'put' : 'post';

    try {
      setLoading(true);

      // Format date to DD-MM-YYYY for API
      const [year, month, day] = formData.tgl_faktur.split('-');
      const formattedDate = `${day}-${month}-${year}`;

      const payload = {
        ...formData,
        tgl_faktur: formattedDate,
        // nominal is already a number, no need to format
      };

      console.log('Submitting payload:', payload);

      const res = await axios[method](url, payload, {
        withCredentials: true,
      });

      console.log('Response:', res.data);

      if (res.data.success) {
        alert(
          isEditMode
            ? 'Deposit updated successfully'
            : 'Deposit created successfully',
        );
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      alert(
        error.response?.data?.message ||
          `Failed to ${isEditMode ? 'update' : 'create'} deposit`,
      );
    } finally {
      setLoading(false);
    }
  };

  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: customer.nama_customer,
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl">
          <h2 className="text-2xl font-bold">
            {isEditMode ? 'Edit Down Payment' : 'Create Down Payment'}
          </h2>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nomor Sales Deposit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Sales Deposit
              </label>
              <input
                type="text"
                name="no_deposit"
                value={formData.no_deposit}
                readOnly
                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
              />
            </div>

            {/* Pelanggan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pelanggan <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                options={customerOptions}
                value={selectedCustomer}
                onChange={handleCustomerSelect}
                placeholder="Pilih Data"
                disabled={loading}
              />
            </div>

            {/* Billing Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Address
              </label>
              <textarea
                readOnly
                name="billing_address"
                value={formData.billing_address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter billing address"
              />
            </div>

            {/* Cara Bayar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cara Bayar <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                options={paymentMethods}
                value={
                  paymentMethods.find(
                    (opt) => opt.value === formData.cara_bayar,
                  ) || null
                }
                onChange={(selected) =>
                  handleSelectChange(selected, 'cara_bayar')
                }
                placeholder="Select payment method"
                disabled={loading}
              />
            </div>

            {/* Tanggal Faktur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Faktur <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tgl_faktur"
                value={formData.tgl_faktur}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keterangan
              </label>
              <SearchableSelect
                options={keteranganOptions}
                value={
                  keteranganOptions.find(
                    (opt) => opt.value === formData.keterangan,
                  ) || null
                }
                onChange={(selected) =>
                  handleSelectChange(selected, 'keterangan')
                }
                placeholder="Select bank/description"
                disabled={loading}
              />
            </div>

            {/* Nominal Sales Deposit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nominal Sales Deposit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nominal"
                value={nominalDisplay}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter nominal amount"
              />
            </div>

            {/* Catatan */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter notes or additional information"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepositForm;
