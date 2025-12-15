import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import PrintDoModal from './PrintDoModal';

interface DOItem {
  id: number;
  id_do_group: number | null;
  id_jo: number;
  id_io: number;
  id_so: number;
  id_customer: number;
  id_produk: number | null;
  no_jo: string;
  no_io: string;
  no_so: string;
  no_po_customer: string;
  customer: string | null;
  produk: string | null;
  po_qty: number;
  jumlah_qty: number | null;
  pack_1: number | null;
  pack_2: number | null;
  pack_3: number | null;
  isi_1: number | null;
  isi_2: number | null;
  isi_3: number | null;
  tgl_pengiriman: string;
  toleransi_pengiriman: number | null;
  note: string | null;
  status: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  detail_customer?: {
    id: number;
    nama_customer: string;
    alamat_kantor: string;
    telepon: string;
    email: string;
    npwp: string;
    fax: string;
    kontak_person: string;
    top_faktur: string;
    toleransi_pengiriman: string;
    kode_marketing: string;
    id_marketing: number;
    id_harga_pengiriman: number | null;
    is_active: boolean;
    is_customer_kanban: boolean;
    no_legalitas: string | null;
    saldo: number | null;
    createdAt: string;
    updatedAt: string;
    harga_pengiriman?: {
      id: number;
      nama_area: string;
      harga: number;
      is_active: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
}

interface CreateDOPopupProps {
  selectedItems: DOItem[];
  doGroupId?: number;
  isConfirmationMode?: boolean;
  existingData?: any;
  onClose: () => void;
  onSuccess: () => void;
}

interface DOFormData {
  id: number;
  jumlah_qty: number;
  pack_1: number;
  pack_2: number;
  pack_3: number;
  isi_1: number;
  isi_2: number;
  isi_3: number;
}

interface Kendaraan {
  id: number;
  nomor_kendaraan: string;
  nama_kendaraan: string;
  is_active: boolean;
}

interface SelectOption {
  value: number;
  label: string;
}

interface DONomorResponse {
  no_do_non_tax: string;
  no_do_non_tax_new: string;
  no_do_tax: string;
  no_do_tax_new: string;
  status: number;
  success: boolean;
}

const CreateDOPopup: React.FC<CreateDOPopupProps> = ({
  selectedItems,
  doGroupId,
  isConfirmationMode = false,
  existingData,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Store the actual items to display (either from selectedItems or fetched delivery_order)
  const [displayItems, setDisplayItems] = useState<DOItem[]>(selectedItems);

  // Master data states
  const [kendaraanList, setKendaraanList] = useState<Kendaraan[]>([]);
  const [supirList, setSupirList] = useState<any[]>([]);
  const [kenekList, setKenekList] = useState<any[]>([]);

  // Select options
  const [kendaraanOptions, setKendaraanOptions] = useState<SelectOption[]>([]);
  const [supirOptions, setSupirOptions] = useState<SelectOption[]>([]);
  const [kenekOptions, setKenekOptions] = useState<SelectOption[]>([]);

  // DO Nomor data
  const [doNomorData, setDoNomorData] = useState<DONomorResponse | null>(null);

  // Get alamat_kantor from the first selected item
  const getAlamatKantor = () => {
    return selectedItems[0]?.detail_customer?.alamat_kantor || '';
  };

  // Get nama_area from the first selected item
  const getNamaArea = () => {
    return selectedItems[0]?.detail_customer?.harga_pengiriman?.nama_area || '';
  };

  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printDoGroupId, setPrintDoGroupId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    no_do: '',
    tgl_do: new Date().toISOString().split('T')[0],
    id_kendaraan: null as number | null,
    id_supir: null as number | null,
    id_kenek: null as number | null,
    id_kenek_2: null as number | null,
    no_jo: selectedItems[0]?.no_jo || '',
    no_po_customer: selectedItems[0]?.no_po_customer || '',
    pelanggan: selectedItems[0]?.customer || '',
    alamat: getAlamatKantor(), // Auto-fill from alamat_kantor
    kota: getNamaArea(), // Auto-fill from nama_area
    is_tax: false,
    note: '',
  });

  const [doItems, setDoItems] = useState<DOFormData[]>(
    selectedItems.map((item) => ({
      id: item.id,
      jumlah_qty: item.jumlah_qty || 0,
      pack_1: item.pack_1 || 0,
      pack_2: item.pack_2 || 0,
      pack_3: item.pack_3 || 0,
      isi_1: item.isi_1 || 0,
      isi_2: item.isi_2 || 0,
      isi_3: item.isi_3 || 0,
    })),
  );

  // Update alamat and kota when selectedItems change
  useEffect(() => {
    const alamatKantor = getAlamatKantor();
    const namaArea = getNamaArea();

    if (!isConfirmationMode) {
      setFormData((prev) => ({
        ...prev,
        alamat: alamatKantor,
        kota: namaArea,
      }));
    }
  }, [selectedItems]);

  // Fetch master data on mount
  useEffect(() => {
    fetchKendaraan();
    fetchSupirKenek();
    fetchNoDO();
  }, []);

  // Fetch DO Group details for confirmation mode
  useEffect(() => {
    if (isConfirmationMode && doGroupId) {
      fetchDOGroupDetails();
    }
  }, [isConfirmationMode, doGroupId]);

  // Auto-update No DO when tax status changes
  useEffect(() => {
    if (doNomorData && !isConfirmationMode) {
      const newNoDo = formData.is_tax
        ? doNomorData.no_do_tax_new
        : doNomorData.no_do_non_tax_new;

      setFormData((prev) => ({
        ...prev,
        no_do: newNoDo,
      }));
    }
  }, [formData.is_tax, doNomorData, isConfirmationMode]);

  const fetchNoDO = async () => {
    try {
      const url = `${import.meta.env.VITE_API_LINK}/deliveryOrderGroupNomor`;
      const res = await axios.get<DONomorResponse>(url, {
        withCredentials: true,
      });

      console.log('Fetched No DO:', res.data);
      setDoNomorData(res.data);

      // Set initial No DO based on default is_tax value (false = non-tax)
      if (!isConfirmationMode) {
        setFormData((prev) => ({
          ...prev,
          no_do: res.data.no_do_non_tax_new,
        }));
      }
    } catch (error) {
      console.error('Error fetching No DO:', error);
      setError('Failed to fetch DO number');
    }
  };

  const fetchKendaraan = async () => {
    try {
      const url = `${import.meta.env.VITE_API_LINK}/master/kendaraan`;
      const res = await axios.get(url, {
        withCredentials: true,
      });

      const data = res.data.data || res.data;
      setKendaraanList(data);
      setKendaraanOptions(
        data
          .filter((item: Kendaraan) => item.is_active)
          .map((item: Kendaraan) => ({
            value: item.id,
            label: `${item.nomor_kendaraan} - ${item.nama_kendaraan}`,
          })),
      );
    } catch (error) {
      console.error('Error fetching kendaraan:', error);
    }
  };

  const fetchSupirKenek = async () => {
    try {
      const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;
      const res = await axios.get(url, {
        params: {
          is_active: true,
        },
        withCredentials: true,
      });

      const data = res.data.data || res.data;

      // Filter by EXPEDITION division (case-insensitive, with various possible spellings)
      const expeditionEmployees = data.filter((item: any) => {
        const divisiName =
          item.biodata_karyawan[0]?.divisi?.nama_divisi?.toLowerCase() || '';
        return (
          divisiName.includes('expedition') ||
          divisiName.includes('ekspedisi') ||
          divisiName.includes('expedisi') ||
          divisiName.includes('pengiriman') ||
          divisiName.includes('delivery')
        );
      });

      setSupirList(expeditionEmployees);
      setKenekList(expeditionEmployees);

      const options = expeditionEmployees.map((item: any) => {
        const latestBagianMesin =
          item.biodata_karyawan[0]?.bagian_mesin_karyawan?.slice(-1)[0]
            ?.nama_bagian_mesin || '';

        return {
          value: item.userid,
          label: `${item.biodata_karyawan[0]?.nik} - ${item.name} - ${item.biodata_karyawan[0]?.jabatan?.nama_jabatan} - ${latestBagianMesin} - ${item.biodata_karyawan[0]?.divisi?.nama_divisi}`,
        };
      });

      setSupirOptions(options);
      setKenekOptions(options);
    } catch (error) {
      console.error('Error fetching supir/kenek:', error);
    }
  };

  const fetchDOGroupDetails = async () => {
    if (!doGroupId) return;

    try {
      setIsLoadingData(true);
      const url = `${
        import.meta.env.VITE_API_LINK
      }/deliveryOrderGroup/${doGroupId}`;
      const res = await axios.get(url, {
        withCredentials: true,
      });

      const data = res.data.data || res.data;

      console.log('Full API Response:', res.data);
      console.log('Fetched DO Group details for confirmation:', data);

      // Pre-fill form data from the main DO Group object
      setFormData({
        no_do: data.no_do || '',
        tgl_do: data.tgl_do
          ? new Date(data.tgl_do).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        id_kendaraan: data.id_kendaraan || null,
        id_supir: data.id_supir || null,
        id_kenek: data.id_kenek || null,
        id_kenek_2: data.id_kenek_2 || null,
        no_jo: data.no_jo || '',
        no_po_customer: data.no_po_customer || '',
        pelanggan: data.customer || data.pelanggan || '',
        alamat: data.alamat || '',
        kota: data.kota || '',
        is_tax: data.is_tax || false,
        note: data.note || '',
      });

      // Pre-fill DO items from delivery_order array (for KonfirmasiDO)
      if (
        data.delivery_order &&
        Array.isArray(data.delivery_order) &&
        data.delivery_order.length > 0
      ) {
        // Set display items for rendering
        setDisplayItems(data.delivery_order);

        const mappedItems = data.delivery_order.map((item: any) => ({
          id: item.id,
          jumlah_qty: item.jumlah_qty || 0,
          pack_1: item.pack_1 || 0,
          pack_2: item.pack_2 || 0,
          pack_3: item.pack_3 || 0,
          isi_1: item.isi_1 || 0,
          isi_2: item.isi_2 || 0,
          isi_3: item.isi_3 || 0,
        }));

        console.log('Mapped DO items from delivery_order:', mappedItems);
        setDoItems(mappedItems);
      }
      // Fallback to data_do if delivery_order doesn't exist (backward compatibility)
      else if (
        data.data_do &&
        Array.isArray(data.data_do) &&
        data.data_do.length > 0
      ) {
        setDisplayItems(data.data_do);

        const mappedItems = data.data_do.map((item: any) => ({
          id: item.id,
          jumlah_qty: item.jumlah_qty || 0,
          pack_1: item.pack_1 || 0,
          pack_2: item.pack_2 || 0,
          pack_3: item.pack_3 || 0,
          isi_1: item.isi_1 || 0,
          isi_2: item.isi_2 || 0,
          isi_3: item.isi_3 || 0,
        }));

        console.log('Mapped DO items from data_do:', mappedItems);
        setDoItems(mappedItems);
      } else {
        console.warn('No delivery_order or data_do array found in response');
        console.warn('Available keys in data:', Object.keys(data));
      }
    } catch (error) {
      console.error('Error fetching DO Group details:', error);
      setError('Failed to load DO details');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateItemQty = (pack: number, isi: number): number => {
    return pack * isi;
  };

  const handleDOItemChange = (
    index: number,
    field: keyof DOFormData,
    value: number,
  ) => {
    setDoItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Auto-calculate jumlah_qty based on pack and isi
      const item = updated[index];
      const qty1 = calculateItemQty(item.pack_1, item.isi_1);
      const qty2 = calculateItemQty(item.pack_2, item.isi_2);
      const qty3 = calculateItemQty(item.pack_3, item.isi_3);

      updated[index].jumlah_qty = qty1 + qty2 + qty3;

      return updated;
    });
  };

  const calculateTotalPack = () => {
    return doItems.reduce(
      (sum, item) =>
        sum + (item.pack_1 || 0) + (item.pack_2 || 0) + (item.pack_3 || 0),
      0,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.no_do.trim()) {
      setError('No DO is required');
      return;
    }
    if (!formData.alamat.trim()) {
      setError('Address is required');
      return;
    }
    if (!formData.kota.trim()) {
      setError('City is required');
      return;
    }
    if (!formData.id_kendaraan) {
      setError('Kendaraan is required');
      return;
    }

    try {
      setIsSubmitting(true);

      // Determine URL and method based on mode
      const url =
        isConfirmationMode && doGroupId
          ? `${
              import.meta.env.VITE_API_LINK
            }/deliveryOrderGroup/konfirmasi/${doGroupId}`
          : `${import.meta.env.VITE_API_LINK}/deliveryOrderGroup`;

      const payload = {
        id_io: displayItems[0].id_io,
        id_so: displayItems[0].id_so,
        id_customer: displayItems[0].id_customer,
        id_produk: displayItems[0].id_produk,
        no_do: formData.no_do,
        tgl_do: formData.tgl_do,
        id_kendaraan: formData.id_kendaraan,
        id_supir: formData.id_supir,
        id_kenek: formData.id_kenek,
        id_kenek_2: formData.id_kenek_2,
        no_jo: formData.no_jo,
        no_po_customer: formData.no_po_customer,
        pelanggan: formData.pelanggan,
        alamat: formData.alamat,
        kota: formData.kota,
        is_tax: formData.is_tax,
        note: formData.note,
        data_do: doItems,
      };

      console.log('Submitting payload:', payload);

      // Use PUT for confirmation, POST for creation
      if (isConfirmationMode && doGroupId) {
        await axios.put(url, payload, {
          withCredentials: true,
        });
      } else {
        await axios.post(url, payload, {
          withCredentials: true,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating/confirming DO:', err);
      setError(err.response?.data?.message || 'Failed to save DO');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    // Re-fetch DO number to get fresh numbers
    fetchNoDO();

    setFormData({
      no_do: doNomorData?.no_do_non_tax_new || '',
      tgl_do: new Date().toISOString().split('T')[0],
      id_kendaraan: null,
      id_supir: null,
      id_kenek: null,
      id_kenek_2: null,
      no_jo: selectedItems[0]?.no_jo || '',
      no_po_customer: selectedItems[0]?.no_po_customer || '',
      pelanggan: selectedItems[0]?.customer || '',
      alamat: getAlamatKantor(), // Reset to alamat_kantor
      kota: getNamaArea(), // Reset to nama_area
      is_tax: false,
      note: '',
    });

    setDoItems(
      displayItems.map((item) => ({
        id: item.id,
        jumlah_qty: 0,
        pack_1: 0,
        pack_2: 0,
        pack_3: 0,
        isi_1: 0,
        isi_2: 0,
        isi_3: 0,
      })),
    );
    setError('');
  };

  const handlePrint = () => {
    if (doGroupId) {
      setPrintDoGroupId(doGroupId);
      setShowPrintModal(true);
    } else {
      alert('Please save the DO first before printing');
    }
  };

  // Custom styles for react-select
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: '32px',
      fontSize: '0.875rem',
      borderColor: '#d1d5db',
      '&:hover': {
        borderColor: '#3b82f6',
      },
    }),
    menu: (base: any) => ({
      ...base,
      fontSize: '0.875rem',
    }),
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {isConfirmationMode ? 'Konfirmasi DO' : 'Create DO'}
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              disabled={isSubmitting || isLoadingData}
            >
              <svg
                className="w-6 h-6"
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
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoadingData && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">Loading DO data...</p>
            </div>
          </div>
        )}

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex gap-6">
              {/* LEFT COLUMN - 30% width */}
              <div className="w-[30%] space-y-5">
                {/* DO Information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">
                    DO Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        No DO <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.no_do}
                        onChange={(e) =>
                          handleInputChange('no_do', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                        placeholder="Auto-generated based on tax selection"
                        required
                        disabled={
                          isSubmitting || isLoadingData || isConfirmationMode
                        }
                        readOnly={!isConfirmationMode}
                        title="Auto-generated based on tax selection"
                      />
                    </div>
                    <div className="flex items-center gap-4 pt-1">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_pajak"
                          checked={formData.is_tax}
                          onChange={(e) =>
                            handleInputChange('is_tax', e.target.checked)
                          }
                          className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          disabled={
                            isSubmitting || isLoadingData || isConfirmationMode
                          }
                        />
                        <label
                          htmlFor="is_pajak"
                          className="ml-1.5 text-xs text-gray-700"
                        >
                          Pajak
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_non_pajak"
                          checked={!formData.is_tax}
                          onChange={(e) =>
                            handleInputChange('is_tax', !e.target.checked)
                          }
                          className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          disabled={
                            isSubmitting || isLoadingData || isConfirmationMode
                          }
                        />
                        <label
                          htmlFor="is_non_pajak"
                          className="ml-1.5 text-xs text-gray-700"
                        >
                          Non Pajak
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tgl DO
                      </label>
                      <input
                        type="date"
                        value={formData.tgl_do}
                        onChange={(e) =>
                          handleInputChange('tgl_do', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={
                          isSubmitting || isLoadingData || isConfirmationMode
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">
                    Delivery Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        No. Plat <span className="text-red-500">*</span>
                      </label>
                      <Select
                        options={kendaraanOptions}
                        value={
                          kendaraanOptions.find(
                            (opt) => opt.value === formData.id_kendaraan,
                          ) || null
                        }
                        onChange={(selected) =>
                          handleInputChange(
                            'id_kendaraan',
                            selected ? selected.value : null,
                          )
                        }
                        placeholder="Pilih Nomor Plat"
                        isClearable
                        isSearchable
                        styles={selectStyles}
                        isDisabled={
                          isSubmitting || isLoadingData || isConfirmationMode
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Pilih Supir
                      </label>
                      <Select
                        options={supirOptions}
                        value={
                          supirOptions.find(
                            (opt) => opt.value === formData.id_supir,
                          ) || null
                        }
                        onChange={(selected) =>
                          handleInputChange(
                            'id_supir',
                            selected ? selected.value : null,
                          )
                        }
                        placeholder="Pilih Supir"
                        isClearable
                        isSearchable
                        styles={selectStyles}
                        isDisabled={
                          isSubmitting || isLoadingData || isConfirmationMode
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Pilih Kenek
                      </label>
                      <Select
                        options={kenekOptions}
                        value={
                          kenekOptions.find(
                            (opt) => opt.value === formData.id_kenek,
                          ) || null
                        }
                        onChange={(selected) =>
                          handleInputChange(
                            'id_kenek',
                            selected ? selected.value : null,
                          )
                        }
                        placeholder="Pilih Kenek"
                        isClearable
                        isSearchable
                        styles={selectStyles}
                        isDisabled={
                          isSubmitting || isLoadingData || isConfirmationMode
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Pilih Kenek 2
                      </label>
                      <Select
                        options={kenekOptions}
                        value={
                          kenekOptions.find(
                            (opt) => opt.value === formData.id_kenek_2,
                          ) || null
                        }
                        onChange={(selected) =>
                          handleInputChange(
                            'id_kenek_2',
                            selected ? selected.value : null,
                          )
                        }
                        placeholder="Pilih Kenek 2"
                        isClearable
                        isSearchable
                        styles={selectStyles}
                        isDisabled={
                          isSubmitting || isLoadingData || isConfirmationMode
                        }
                      />
                    </div>
                  </div>
                </div>
                {/* Customer Information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">
                    Customer Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Pelanggan
                      </label>
                      <input
                        type="text"
                        value={formData.pelanggan}
                        onChange={(e) =>
                          handleInputChange('pelanggan', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="ROHTO LABORATORIES"
                        disabled={
                          isSubmitting || isLoadingData || isConfirmationMode
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Alamat <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.alamat}
                        onChange={(e) =>
                          handleInputChange('alamat', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50"
                        placeholder="Auto-filled from customer address"
                        required
                        disabled={
                          isSubmitting || isLoadingData || isConfirmationMode
                        }
                        title="Auto-filled from customer's office address"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Kota <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.kota}
                        onChange={(e) =>
                          handleInputChange('kota', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50"
                        placeholder="Auto-filled from customer area"
                        required
                        disabled={
                          isSubmitting || isLoadingData || isConfirmationMode
                        }
                        title="Auto-filled from customer's area name"
                      />
                    </div>
                    {/* Note */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Note
                      </label>
                      <textarea
                        value={formData.note}
                        onChange={(e) =>
                          handleInputChange('note', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Additional notes..."
                        rows={3}
                        disabled={
                          isSubmitting || isLoadingData || isConfirmationMode
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Order Details */}
              </div>

              {/* RIGHT COLUMN - 70% width */}
              <div className="w-[70%]">
                <div className="pb-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">
                    Order Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Nomor PO
                      </label>
                      <input
                        type="text"
                        value={formData.no_po_customer}
                        onChange={(e) =>
                          handleInputChange('no_po_customer', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="4000375B_40005918"
                        disabled={
                          isSubmitting || isLoadingData || isConfirmationMode
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Nomor JO
                      </label>
                      <input
                        type="text"
                        value={formData.no_jo}
                        onChange={(e) =>
                          handleInputChange('no_jo', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="JO-24-00219_JO-24-00500"
                        disabled={
                          isSubmitting || isLoadingData || isConfirmationMode
                        }
                      />
                    </div>
                  </div>
                </div>
                {/* Items - 3 Columns Grid */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">
                    Delivery Items ({displayItems.length})
                  </h4>
                  <div className="space-y-4 max-h-[650px] overflow-y-auto pr-2">
                    <div className="grid grid-cols-3 gap-3">
                      {displayItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                        >
                          {/* Item Header */}
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-900 line-clamp-2 min-h-[32px]">
                              {item.produk || '-'}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">
                              PO Qty: {item.po_qty?.toLocaleString('id-ID')}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              Total Qty:{' '}
                              <span className="font-semibold text-blue-600">
                                {doItems[index]?.jumlah_qty.toLocaleString(
                                  'id-ID',
                                ) || 0}
                              </span>
                            </p>
                          </div>
                          {/* Pack x Isi Inputs - Vertical */}
                          <div className="space-y-2">
                            {/* Pack 1 */}
                            <div>
                              <label className="block text-[10px] font-medium text-gray-600 mb-1">
                                Pack 1 × Isi
                              </label>
                              <div className="grid grid-cols-2 gap-1">
                                <input
                                  type="number"
                                  value={doItems[index]?.pack_1 || 0}
                                  onChange={(e) =>
                                    handleDOItemChange(
                                      index,
                                      'pack_1',
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  min="0"
                                  placeholder="0"
                                  disabled={isSubmitting || isLoadingData}
                                />
                                <input
                                  type="number"
                                  value={doItems[index]?.isi_1 || 0}
                                  onChange={(e) =>
                                    handleDOItemChange(
                                      index,
                                      'isi_1',
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  min="0"
                                  placeholder="0"
                                  disabled={isSubmitting || isLoadingData}
                                />
                              </div>
                            </div>

                            {/* Pack 2 */}
                            <div>
                              <label className="block text-[10px] font-medium text-gray-600 mb-1">
                                Pack 2 × Isi
                              </label>
                              <div className="grid grid-cols-2 gap-1">
                                <input
                                  type="number"
                                  value={doItems[index]?.pack_2 || 0}
                                  onChange={(e) =>
                                    handleDOItemChange(
                                      index,
                                      'pack_2',
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  min="0"
                                  placeholder="0"
                                  disabled={isSubmitting || isLoadingData}
                                />
                                <input
                                  type="number"
                                  value={doItems[index]?.isi_2 || 0}
                                  onChange={(e) =>
                                    handleDOItemChange(
                                      index,
                                      'isi_2',
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  min="0"
                                  placeholder="0"
                                  disabled={isSubmitting || isLoadingData}
                                />
                              </div>
                            </div>

                            {/* Pack 3 */}
                            <div>
                              <label className="block text-[10px] font-medium text-gray-600 mb-1">
                                Pack 3 × Isi
                              </label>
                              <div className="grid grid-cols-2 gap-1">
                                <input
                                  type="number"
                                  value={doItems[index]?.pack_3 || 0}
                                  onChange={(e) =>
                                    handleDOItemChange(
                                      index,
                                      'pack_3',
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  min="0"
                                  placeholder="0"
                                  disabled={isSubmitting || isLoadingData}
                                />
                                <input
                                  type="number"
                                  value={doItems[index]?.isi_3 || 0}
                                  onChange={(e) =>
                                    handleDOItemChange(
                                      index,
                                      'isi_3',
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  min="0"
                                  placeholder="0"
                                  disabled={isSubmitting || isLoadingData}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total Pack */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">
                          TOTAL PACK:
                        </span>
                        <span className="text-xl font-bold text-blue-600">
                          {calculateTotalPack().toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-3 py-2 rounded text-xs border border-red-200 mt-4">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-gray-50 flex-shrink-0 rounded-b-lg">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isLoadingData}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={isSubmitting || isLoadingData}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={isSubmitting || isLoadingData || !doGroupId}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Print
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || isLoadingData}
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {(isSubmitting || isLoadingData) && (
                <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              )}
              {isSubmitting
                ? 'Menyimpan...'
                : isLoadingData
                ? 'Loading...'
                : isConfirmationMode
                ? 'Konfirmasi'
                : 'Simpan'}
            </button>
          </div>
        </div>
      </div>

      {showPrintModal && (
        <PrintDoModal
          isOpen={showPrintModal}
          doGroupId={printDoGroupId}
          onClose={() => {
            setShowPrintModal(false);
            setPrintDoGroupId(null);
          }}
        />
      )}
    </div>
  );
};
export default CreateDOPopup;
