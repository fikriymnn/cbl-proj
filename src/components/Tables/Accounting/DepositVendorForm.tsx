import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DepositVendorItem {
  id: number;
  id_vendor: number;
  id_create: number;
  id_approve: number | null;
  id_reject: number | null;
  no_deposit: string;
  cara_bayar: string;
  keterangan?: string | null;
  billing_address: string;
  tgl_faktur: string;
  nominal: number;
  note: string;
  note_reject?: string | null;
  status: string;
  status_proses: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  vendor?: { id: number; nama_vendor: string } | null;
  user_create?: { id: number; nama: string; email?: string } | null;
  user_approve?: { id: number; nama: string; email?: string } | null;
  user_reject?: { id: number; nama: string; email?: string } | null;
}

interface Vendor {
  id: number;
  nama_vendor: string;
  alamat?: string;
  is_active?: boolean;
}

interface DepositVendorFormProps {
  deposit?: DepositVendorItem | null;
  isEditMode?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface DepositVendorFormData {
  id_vendor: number | null;
  no_deposit: string;
  cara_bayar: string;
  keterangan: string;
  billing_address: string;
  tgl_faktur: string;
  nominal: number;
  note: string;
}

interface Option {
  value: string | number;
  label: string;
}

// ─── SearchableSelect ─────────────────────────────────────────────────────────

interface SearchableSelectProps {
  options: Option[];
  value: Option | null;
  onChange: (selected: Option | null) => void;
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

  const handleSelect = (option: Option) => {
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAYMENT_METHODS: Option[] = [
  { value: 'TUNAI', label: 'Tunai' },
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'GIRO', label: 'Giro' },
  { value: 'CEK', label: 'Cek' },
];

const KETERANGAN_OPTIONS: Option[] = [
  { value: 'BCA', label: 'BCA' },
  { value: 'MANDIRI', label: 'Mandiri' },
  { value: 'BNI', label: 'BNI' },
  { value: 'BRI', label: 'BRI' },
  { value: 'LAINNYA', label: 'Lainnya' },
];

const ensureArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
};

const formatNumber = (value: number): string => {
  if (!value) return '';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ─── Form ─────────────────────────────────────────────────────────────────────

const DepositVendorForm: React.FC<DepositVendorFormProps> = ({
  deposit,
  isEditMode = false,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Option | null>(null);
  const [formData, setFormData] = useState<DepositVendorFormData>({
    id_vendor: null,
    no_deposit: '',
    cara_bayar: '',
    keterangan: '',
    billing_address: '',
    tgl_faktur: '',
    nominal: 0,
    note: '',
  });
  const [nominalDisplay, setNominalDisplay] = useState<string>('');

  useEffect(() => {
    fetchVendors();
    if (isEditMode && deposit) {
      // Data diambil dari row list (tidak ada endpoint detail)
      setFormData({
        id_vendor: deposit.id_vendor,
        no_deposit: deposit.no_deposit,
        cara_bayar: deposit.cara_bayar || '',
        keterangan: deposit.keterangan || '',
        billing_address: deposit.billing_address || '',
        tgl_faktur: deposit.tgl_faktur
          ? formatDateForInput(deposit.tgl_faktur)
          : '',
        nominal: deposit.nominal || 0,
        note: deposit.note || '',
      });
      setNominalDisplay(formatNumber(deposit.nominal || 0));
      if (deposit.vendor) {
        setSelectedVendor({
          value: deposit.vendor.id,
          label: deposit.vendor.nama_vendor,
        });
      }
    } else {
      fetchDepositNumber();
    }
    // eslint-disable-next-line
  }, [isEditMode, deposit?.id]);

  const fetchVendors = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/master/marketing/vendor/list`;
    try {
      const res = await axios.get(url, {
        params: { page: 1, limit: 1000 },
        withCredentials: true,
      });
      const list: Vendor[] = ensureArray(res.data?.data ?? res.data);
      setVendors(list.filter((v) => v.is_active !== false));
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setVendors([]);
    }
  };

  const fetchDepositNumber = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/depositVendorNomor`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      if (res.data?.new_no_deposit) {
        setFormData((prev) => ({
          ...prev,
          no_deposit: res.data.new_no_deposit,
        }));
      }
    } catch (error) {
      console.error('Error fetching deposit vendor number:', error);
    }
  };

  const handleVendorSelect = (selected: Option | null) => {
    if (selected) {
      const id = Number(selected.value);
      setSelectedVendor({ value: id, label: selected.label });
      const vendor = vendors.find((v) => v.id === id);
      setFormData((prev) => ({
        ...prev,
        id_vendor: id,
        // auto-isi alamat vendor, tetap bisa diedit
        billing_address: vendor?.alamat || prev.billing_address,
      }));
    } else {
      setSelectedVendor(null);
      setFormData((prev) => ({ ...prev, id_vendor: null }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === 'nominal') {
      const numericValue = value.replace(/\D/g, '');
      const parsedValue = numericValue === '' ? 0 : parseInt(numericValue, 10);
      setFormData((prev) => ({ ...prev, nominal: parsedValue }));
      setNominalDisplay(formatNumber(parsedValue));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (selected: Option | null, fieldName: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: selected ? selected.value : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id_vendor) {
      alert('Please select a vendor');
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

    const url =
      isEditMode && deposit
        ? `${import.meta.env.VITE_API_LINK}/depositVendor/${deposit.id}`
        : `${import.meta.env.VITE_API_LINK}/depositVendor`;
    const method = isEditMode ? 'put' : 'post';

    try {
      setLoading(true);

      // Format tanggal ke DD-MM-YYYY untuk API
      const [year, month, day] = formData.tgl_faktur.split('-');

      const payload = {
        id_vendor: formData.id_vendor,
        no_deposit: formData.no_deposit,
        cara_bayar: formData.cara_bayar,
        keterangan: formData.keterangan,
        billing_address: formData.billing_address,
        tgl_faktur: `${day}-${month}-${year}`,
        nominal: formData.nominal,
        note: formData.note,
      };

      console.log('Submitting vendor deposit payload:', payload);

      const res = await axios[method](url, payload, { withCredentials: true });

      if (res.data.success) {
        alert(
          isEditMode
            ? 'Deposit vendor updated successfully'
            : 'Deposit vendor created successfully',
        );
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      alert(
        error.response?.data?.message ||
          `Failed to ${isEditMode ? 'update' : 'create'} deposit vendor`,
      );
    } finally {
      setLoading(false);
    }
  };

  const vendorOptions: Option[] = vendors.map((v) => ({
    value: v.id,
    label: v.nama_vendor,
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl z-10">
          <h2 className="text-2xl font-bold">
            {isEditMode
              ? 'Edit Down Payment Vendor'
              : 'Create Down Payment Vendor'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nomor Deposit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Deposit Vendor
              </label>
              <input
                type="text"
                name="no_deposit"
                value={formData.no_deposit}
                readOnly
                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
              />
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                options={vendorOptions}
                value={selectedVendor}
                onChange={handleVendorSelect}
                placeholder="Pilih Vendor"
                disabled={loading}
              />
            </div>

            {/* Billing Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Address
              </label>
              <textarea
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
                options={PAYMENT_METHODS}
                value={
                  PAYMENT_METHODS.find(
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
                options={KETERANGAN_OPTIONS}
                value={
                  KETERANGAN_OPTIONS.find(
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

            {/* Nominal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nominal Deposit <span className="text-red-500">*</span>
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

export default DepositVendorForm;
