// components/SOCreatePopup.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchableSelect from '../../../../pages/MasterData/Marketing/SearchableSelect';
import { SOFormData, KalkulasiData, Gudang } from './types/SOTypes';

interface SOCreatePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SOFormData) => void;
  loading?: boolean;
  mode?: 'create' | 'edit' | 'history'; // 'create' for new SO, 'edit' for SOMarketing detail, 'history' for HistorySO
  initialData?: SOFormData | null; // Add initialData prop for edit mode
}

const SOCreatePopup: React.FC<SOCreatePopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  mode = 'create', // Default to 'create' mode
  initialData = null,
}) => {
  const [formData, setFormData] = useState<SOFormData>({
    tgl_input_po: new Date().toISOString().split('T')[0],
    no_so: '',
    id_kalkulasi: null,
    id_so_cancel: null,
    so_cancel: '',
    no_booking: '',
    status_jo: '',
    customer: '',
    produk: '',
    status_produk: '',
    tgl_acc_customer: '',
    tgl_po_customer: '',
    po_qty: 0,
    harga_jual: 0,
    total_harga: 0,
    no_po_customer: '',
    keterangan: '',
    ppn: 'yes', // Default to 'yes'
    profit: 0,
    tgl_pengiriman: '',
    alamat_pengiriman: '',
    alamat_penagihan: '', // New field
    ada_standar_warna: 'Tidak',
    is_io_selesai: false,
  });

  interface KalkulasiOption {
    value: string;
    label: string;
    data: KalkulasiData;
  }

  interface GudangOption {
    value: string;
    label: string;
    data: Gudang;
  }

  const [kalkulasiOptions, setKalkulasiOptions] = useState<KalkulasiOption[]>(
    [],
  );
  const [gudangOptions, setGudangOptions] = useState<GudangOption[]>([]);
  const [alamatPenagihanOptions, setAlamatPenagihanOptions] = useState<
    GudangOption[]
  >([]); // New state for alamat penagihan
  const [kalkulasiLoading, setKalkulasiLoading] = useState(false);
  const [loadingSONumber, setLoadingSONumber] = useState(false);
  const [selectedKalkulasiData, setSelectedKalkulasiData] =
    useState<KalkulasiData | null>(null);

  // Store SO number options from API
  const [soNumberData, setSoNumberData] = useState<{
    no_so_tax_new: string;
    no_so_non_tax_new: string;
  } | null>(null);

  // Status Produk options
  const statusProdukOptions = [
    { value: 'OKP', label: 'OKP' },
    { value: 'PROFF', label: 'PROFF' },
    { value: 'ACC', label: 'ACC' },
    { value: 'PPOS', label: 'PPOS' },
  ];

  // Status JO options
  const statusJOOptions = [
    { value: 'baru', label: 'Baru' },
    { value: 'repeat', label: 'Repeat' },
    { value: 'repeat perubahan', label: 'Repeat Perubahan' },
  ];

  // Helper function to check if field is editable based on mode
  const isFieldEditable = (fieldName: string): boolean => {
    if (mode === 'create') {
      // In create mode from SOMarketing, all fields except no_so are editable
      return fieldName !== 'no_so';
    } else if (mode === 'edit') {
      // In edit mode (SOMarketing detail button), ppn, no_so, and id_kalkulasi are NOT editable
      return !['ppn', 'no_so', 'id_kalkulasi'].includes(fieldName);
    } else {
      // In history mode, only status_produk, no_po_customer, and po_qty are editable
      return ['status_produk', 'no_po_customer', 'po_qty'].includes(fieldName);
    }
  };

  // Generate SO Number - only called in create mode
  const generateSONumber = async () => {
    try {
      setLoadingSONumber(true);
      const url = `${import.meta.env.VITE_API_LINK}/marketing/soJumlahData`;

      const res = await axios.get(url, {
        withCredentials: true,
      });
      console.log('SO jumlah data response:', res.data);

      // Store both SO number options
      if (res.data.succes) {
        const soData = {
          no_so_tax_new: res.data.no_so_tax_new || '',
          no_so_non_tax_new: res.data.no_so_non_tax_new || '',
        };
        setSoNumberData(soData);

        // Set initial SO number based on current PPN selection
        const initialSONumber =
          formData.ppn === 'yes'
            ? soData.no_so_tax_new
            : soData.no_so_non_tax_new;

        setFormData((prev) => ({
          ...prev,
          no_so: initialSONumber,
        }));
      }
    } catch (error) {
      console.error('Error generating SO number:', error);
      // Optionally show error message to user
    } finally {
      setLoadingSONumber(false);
    }
  };

  // Update SO number when PPN changes - only in create mode
  useEffect(() => {
    if (mode === 'create' && soNumberData) {
      const newSONumber =
        formData.ppn === 'yes'
          ? soNumberData.no_so_tax_new
          : soNumberData.no_so_non_tax_new;

      setFormData((prev) => ({
        ...prev,
        no_so: newSONumber,
      }));
    }
  }, [formData.ppn, soNumberData, mode]);

  // Fetch Kalkulasi data from API using axios
  const fetchKalkulasiData = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi`;
    setKalkulasiLoading(true);
    try {
      const response = await axios.get(url, {
        params: {
          is_io_active: true,
        },
        withCredentials: true,
      });
      console.log('Fetched Kalkulasi data:', response.data);
      if (response.data.succes && response.data.data) {
        // Group by id_io and filter based on status_kalkulasi
        const groupedByIdIO = response.data.data.reduce(
          (acc: Record<string, KalkulasiData[]>, item: KalkulasiData) => {
            const idIO = item.id_io?.toString() || '';
            if (!acc[idIO]) {
              acc[idIO] = [];
            }
            acc[idIO].push(item);
            return acc;
          },
          {} as Record<string, KalkulasiData[]>,
        );

        // Filter: if multiple items with same id_io, show only 'baru', otherwise show available
        const filteredData: KalkulasiData[] = [];
        Object.keys(groupedByIdIO).forEach((idIO) => {
          const items = groupedByIdIO[idIO];
          if (items.length > 1) {
            // Multiple items with same id_io
            const baruItem = items.find(
              (item: KalkulasiData) =>
                item.status_kalkulasi?.toLowerCase() === 'baru',
            );
            if (baruItem) {
              filteredData.push(baruItem);
            } else {
              // No 'baru' exists, use the first available
              filteredData.push(items[0]);
            }
          } else {
            // Only one item with this id_io
            filteredData.push(items[0]);
          }
        });

        const options = filteredData.map((item: KalkulasiData) => ({
          value: item.id.toString(),
          label: `${item.no_io} - ${item.nama_customer}, ${item.nama_produk}`,
          data: item,
        }));
        setKalkulasiOptions(options);
      }
    } catch (error) {
      console.error('Error fetching Kalkulasi data:', error);
    } finally {
      setKalkulasiLoading(false);
    }
  };

  // Load Kalkulasi data and generate SO number when component mounts
  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        // Only fetch kalkulasi and generate SO number in create mode
        fetchKalkulasiData();
        generateSONumber();
      } else if (mode === 'edit' && initialData) {
        // In edit mode, populate form with initial data
        setFormData(initialData);
        // Optionally fetch kalkulasi data if needed for display
        fetchKalkulasiData();
      } else if (mode === 'history' && initialData) {
        // In history mode, populate form with initial data
        setFormData(initialData);
      }
    }
  }, [isOpen, mode]);

  const handleInputChange = (field: keyof SOFormData, value: any) => {
    // Prevent changes to non-editable fields
    if (!isFieldEditable(field)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Handle Kalkulasi selection (only in create mode)
    if (field === 'id_kalkulasi' && mode === 'create') {
      const selectedOption = kalkulasiOptions.find(
        (option) => option.value === value,
      );
      if (selectedOption) {
        const kalkulasiData = selectedOption.data;
        setSelectedKalkulasiData(kalkulasiData);

        // Check if kalkulasi data exists
        if (
          kalkulasiData &&
          kalkulasiData.total_harga_satuan_customer &&
          kalkulasiData.qty_kalkulasi !== undefined &&
          kalkulasiData.status_kalkulasi
        ) {
          // Auto fill fields based on selected Kalkulasi
          const hargaSatuanCustomer = parseFloat(
            kalkulasiData.total_harga_satuan_customer,
          );
          const qtyKalkulasi = kalkulasiData.qty_kalkulasi;
          const profitValue = kalkulasiData.profit || 0;

          // Set up gudang options from customer data
          if (kalkulasiData.customer && kalkulasiData.customer.gudang) {
            const gudangOpts = kalkulasiData.customer.gudang.map(
              (gudang: Gudang) => ({
                value: gudang.alamat_gudang,
                label: gudang.alamat_gudang,
                data: gudang,
              }),
            );
            setGudangOptions(gudangOpts);
            setAlamatPenagihanOptions(gudangOpts); // Same options for alamat penagihan

            const defaultAlamat = kalkulasiData.customer.alamat_penagihan;

            setFormData((prev) => ({
              ...prev,
              harga_jual: isNaN(hargaSatuanCustomer) ? 0 : hargaSatuanCustomer,
              total_harga: isNaN(hargaSatuanCustomer)
                ? 0
                : hargaSatuanCustomer * (qtyKalkulasi || 0),
              status_jo: kalkulasiData.status_kalkulasi,
              customer: kalkulasiData.nama_customer || '',
              produk: kalkulasiData.nama_produk || '',
              profit: profitValue,
              alamat_pengiriman: defaultAlamat,
              alamat_penagihan: defaultAlamat, // Auto fill alamat penagihan
            }));
          }
        } else {
          console.warn(
            'Selected Kalkulasi does not have complete data:',
            kalkulasiData,
          );
          setFormData((prev) => ({
            ...prev,
            harga_jual: 0,
            po_qty: 0,
            total_harga: 0,
            status_jo: '',
            customer: kalkulasiData?.nama_customer || '',
            produk: kalkulasiData?.nama_produk || '',
            profit: kalkulasiData?.profit || 0,
            alamat_pengiriman: '',
            alamat_penagihan: '',
          }));
          setGudangOptions([]);
          setAlamatPenagihanOptions([]);
        }
      } else {
        setSelectedKalkulasiData(null);
        setGudangOptions([]);
        setAlamatPenagihanOptions([]);
        // Reset fields when no Kalkulasi is selected
        setFormData((prev) => ({
          ...prev,
          harga_jual: 0,
          po_qty: 0,
          total_harga: 0,
          status_jo: '',
          customer: '',
          produk: '',
          profit: 0,
          alamat_pengiriman: '',
          alamat_penagihan: '',
        }));
      }
      return;
    }

    // Auto calculate total_harga when harga_jual or po_qty changes
    if (field === 'harga_jual') {
      const total = value * formData.po_qty;
      setFormData((prev) => ({
        ...prev,
        total_harga: isNaN(total) ? 0 : total,
      }));
    }

    if (field === 'po_qty') {
      const total = formData.harga_jual * value;
      setFormData((prev) => ({
        ...prev,
        total_harga: isNaN(total) ? 0 : total,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for required fields based on mode
    if (mode === 'create') {
      if (!formData.ppn) {
        alert('PPN wajib diisi!');
        return;
      }
      if (!formData.tgl_pengiriman) {
        alert('Tanggal Pengiriman wajib diisi!');
        return;
      }
    }

    // Common validations for both modes
    if (!formData.status_produk) {
      alert('Status Produk wajib diisi!');
      return;
    }
    if (!formData.no_po_customer) {
      alert('Nomor PO Customer wajib diisi!');
      return;
    }
    if (!formData.po_qty || formData.po_qty === 0) {
      alert('PO Qty wajib diisi!');
      return;
    }

    onSubmit(formData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      tgl_input_po: new Date().toISOString().split('T')[0],
      no_so: '',
      id_kalkulasi: null,
      id_so_cancel: null,
      so_cancel: '',
      no_booking: '',
      status_jo: '',
      customer: '',
      produk: '',
      status_produk: '',
      tgl_acc_customer: '',
      tgl_po_customer: '',
      po_qty: 0,
      harga_jual: 0,
      total_harga: 0,
      no_po_customer: '',
      keterangan: '',
      ppn: 'yes', // Reset to default 'yes'
      profit: 0,
      tgl_pengiriman: '',
      alamat_pengiriman: '',
      alamat_penagihan: '',
      ada_standar_warna: 'Tidak',
      is_io_selesai: false,
    });
    setSelectedKalkulasiData(null);
    setGudangOptions([]);
    setAlamatPenagihanOptions([]);
    setSoNumberData(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? 'Create Sales Order' : 'Edit Sales Order'}
          </h2>

          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            type="button"
          >
            ×
          </button>
        </div>
        <div className="px-6 pt-2">
          <input
            type="text"
            value={selectedKalkulasiData?.label || ''}
            readOnly
            className="w-full p-2 text-blue-400 font-bold cursor-not-allowed"
          />
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Row 1 - PPN moved to top */}
            <div>
              <label className="block text-sm font-medium mb-1">
                PPN <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.ppn}
                onChange={(e) => handleInputChange('ppn', e.target.value)}
                className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isFieldEditable('ppn')
                    ? 'bg-gray-100 cursor-not-allowed'
                    : ''
                }`}
                disabled={!isFieldEditable('ppn')}
                required={mode === 'create'}
              >
                <option value="yes">Ya</option>
                <option value="no">Tidak</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tanggal Input PO
              </label>
              <input
                type="date"
                value={formData.tgl_input_po}
                onChange={(e) =>
                  handleInputChange('tgl_input_po', e.target.value)
                }
                className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isFieldEditable('tgl_input_po')
                    ? 'bg-gray-100 cursor-not-allowed'
                    : ''
                }`}
                disabled={!isFieldEditable('tgl_input_po')}
                required={mode === 'create'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nomor SO</label>
              <input
                type="text"
                value={formData.no_so}
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                placeholder={
                  loadingSONumber ? 'Generating...' : 'Auto-generated'
                }
              />
            </div>

            {/* Row 2 */}
            <div>
              <label className="block text-sm font-medium mb-1">NOMOR IO</label>
              <SearchableSelect
                placeholder={kalkulasiLoading ? 'Loading...' : 'Pilih Data'}
                value={formData.id_kalkulasi}
                onChange={(value) => handleInputChange('id_kalkulasi', value)}
                options={kalkulasiOptions}
                disabled={!isFieldEditable('id_kalkulasi')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                SO Cancel
              </label>
              <SearchableSelect
                placeholder="Pilih Data"
                value={formData.so_cancel}
                onChange={(value) => handleInputChange('so_cancel', value)}
                options={[]} // Add your options here
                disabled={!isFieldEditable('so_cancel')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                No Booking
              </label>
              <SearchableSelect
                placeholder="Pilih Data"
                value={formData.no_booking}
                onChange={(value) => handleInputChange('no_booking', value)}
                options={[]} // Add your options here
                disabled={!isFieldEditable('no_booking')}
              />
            </div>

            {/* Row 3 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Status Job Order
              </label>
              <SearchableSelect
                placeholder="Pilih Status JO"
                value={formData.status_jo}
                onChange={(value) => handleInputChange('status_jo', value)}
                options={statusJOOptions}
                disabled={!isFieldEditable('status_jo')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Customer</label>
              <input
                type="text"
                placeholder="Masukan Customer"
                value={formData.customer}
                onChange={(e) => handleInputChange('customer', e.target.value)}
                className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isFieldEditable('customer')
                    ? 'bg-gray-100 cursor-not-allowed'
                    : ''
                }`}
                disabled={!isFieldEditable('customer')}
                required={mode === 'create'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Produk</label>
              <input
                type="text"
                placeholder="Masukan Produk"
                value={formData.produk}
                onChange={(e) => handleInputChange('produk', e.target.value)}
                className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isFieldEditable('produk')
                    ? 'bg-gray-100 cursor-not-allowed'
                    : ''
                }`}
                disabled={!isFieldEditable('produk')}
                required={mode === 'create'}
              />
            </div>

            {/* Row 4 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Status Produk <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                placeholder="Pilih Status Produk"
                value={formData.status_produk}
                onChange={(value) => handleInputChange('status_produk', value)}
                options={statusProdukOptions}
                disabled={!isFieldEditable('status_produk')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tanggal Acc Customer
              </label>
              <input
                type="date"
                value={formData.tgl_acc_customer}
                onChange={(e) =>
                  handleInputChange('tgl_acc_customer', e.target.value)
                }
                className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isFieldEditable('tgl_acc_customer')
                    ? 'bg-gray-100 cursor-not-allowed'
                    : ''
                }`}
                disabled={!isFieldEditable('tgl_acc_customer')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tanggal PO Customer
              </label>
              <input
                type="date"
                value={formData.tgl_po_customer}
                onChange={(e) =>
                  handleInputChange('tgl_po_customer', e.target.value)
                }
                className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isFieldEditable('tgl_po_customer')
                    ? 'bg-gray-100 cursor-not-allowed'
                    : ''
                }`}
                disabled={!isFieldEditable('tgl_po_customer')}
              />
            </div>

            {/* Row 5 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                PO Qty <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Masukan PO Quantity"
                value={formData.po_qty}
                onChange={(e) =>
                  handleInputChange('po_qty', parseInt(e.target.value) || 0)
                }
                className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isFieldEditable('po_qty')
                    ? 'bg-gray-100 cursor-not-allowed'
                    : ''
                }`}
                disabled={!isFieldEditable('po_qty')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Keterangan
              </label>
              <input
                type="text"
                value={formData.keterangan}
                onChange={(e) =>
                  handleInputChange('keterangan', e.target.value)
                }
                className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isFieldEditable('keterangan')
                    ? 'bg-gray-100 cursor-not-allowed'
                    : ''
                }`}
                disabled={!isFieldEditable('keterangan')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Harga Jual
              </label>
              <input
                type="number"
                placeholder="Masukan Harga Jual"
                value={formData.harga_jual}
                onChange={(e) =>
                  handleInputChange(
                    'harga_jual',
                    parseFloat(e.target.value) || 0,
                  )
                }
                className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isFieldEditable('harga_jual')
                    ? 'bg-gray-100 cursor-not-allowed'
                    : ''
                }`}
                disabled={!isFieldEditable('harga_jual')}
                required={mode === 'create'}
              />
            </div>

            {/* Row 6 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Total Harga
              </label>
              <div className="w-full p-2 border border-gray-300 rounded bg-gray-100">
                {formData.total_harga.toLocaleString('id-ID')}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Profit</label>
              <input
                type="number"
                placeholder="Auto filled from Kalkulasi"
                value={formData.profit}
                onChange={(e) =>
                  handleInputChange('profit', parseInt(e.target.value) || 0)
                }
                className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isFieldEditable('profit')
                    ? 'bg-gray-100 cursor-not-allowed'
                    : ''
                }`}
                disabled={!isFieldEditable('profit')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tanggal Pengiriman{' '}
                {mode === 'create' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="date"
                value={formData.tgl_pengiriman}
                onChange={(e) =>
                  handleInputChange('tgl_pengiriman', e.target.value)
                }
                className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isFieldEditable('tgl_pengiriman')
                    ? 'bg-gray-100 cursor-not-allowed'
                    : ''
                }`}
                disabled={!isFieldEditable('tgl_pengiriman')}
                required={mode === 'create'}
              />
            </div>

            {/* Row 7 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Nomor PO Customer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Masukan Nomor PO Customer"
                value={formData.no_po_customer}
                onChange={(e) =>
                  handleInputChange('no_po_customer', e.target.value)
                }
                className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isFieldEditable('no_po_customer')
                    ? 'bg-gray-100 cursor-not-allowed'
                    : ''
                }`}
                disabled={!isFieldEditable('no_po_customer')}
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Alamat Pengiriman
              </label>
              <SearchableSelect
                placeholder="Pilih Alamat Gudang"
                value={formData.alamat_pengiriman}
                onChange={(value) =>
                  handleInputChange('alamat_pengiriman', value)
                }
                options={gudangOptions}
                disabled={!isFieldEditable('alamat_pengiriman')}
              />
            </div>

            {/* Row 8 - New Alamat Penagihan */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Alamat Penagihan
              </label>
              <input
                type="text"
                placeholder="Masukan Alamat Penagihan"
                value={formData.alamat_penagihan}
                onChange={(e) =>
                  handleInputChange('alamat_penagihan', e.target.value)
                }
                className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isFieldEditable('alamat_penagihan')
                    ? 'bg-gray-100 cursor-not-allowed'
                    : ''
                }`}
                disabled={!isFieldEditable('alamat_penagihan')}
                required={mode === 'create'}
              />
            </div>

            {/* Row 9 */}
            <div className="flex justify-between">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ada Standar Warna?
                </label>
                <div className="flex items-center space-x-4 pt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="ada_standar_warna"
                      value="Ya"
                      checked={formData.ada_standar_warna === 'Ya'}
                      onChange={(e) =>
                        handleInputChange('ada_standar_warna', e.target.value)
                      }
                      className="mr-2"
                      disabled={!isFieldEditable('ada_standar_warna')}
                    />
                    Ya
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="ada_standar_warna"
                      value="Tidak"
                      checked={formData.ada_standar_warna === 'Tidak'}
                      onChange={(e) =>
                        handleInputChange('ada_standar_warna', e.target.value)
                      }
                      className="mr-2"
                      disabled={!isFieldEditable('ada_standar_warna')}
                    />
                    Tidak
                  </label>
                </div>
              </div>
              <div>
                <label className="flex items-center space-x-2 pt-7">
                  <input
                    type="checkbox"
                    checked={formData.is_io_selesai}
                    onChange={(e) =>
                      handleInputChange('is_io_selesai', e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    disabled={!isFieldEditable('is_io_selesai')}
                  />
                  <span className="text-sm font-medium">IO Selesai</span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading || loadingSONumber}
            >
              {loading
                ? mode === 'create'
                  ? 'Creating...'
                  : 'Updating...'
                : mode === 'create'
                ? 'Create SO'
                : 'Update SO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SOCreatePopup;
