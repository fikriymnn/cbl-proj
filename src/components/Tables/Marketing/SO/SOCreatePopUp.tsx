// components/SOCreatePopup.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchableSelect from '../../../../pages/MasterData/Marketing/SearchableSelect';
import {
  SOFormData,
  KalkulasiData,
  APIResponse,
  Gudang,
} from './types/SOTypes';

interface SOCreatePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SOFormData) => void;
  loading?: boolean;
}

const SOCreatePopup: React.FC<SOCreatePopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<SOFormData>({
    tgl_input_po: new Date().toISOString().split('T')[0],
    no_so: '',
    id_kalkulasi: null, // Changed from id_io to id_kalkulasi
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
    ppn: '',
    profit: 0,
    tgl_pengiriman: '',
    alamat_pengiriman: '',
    ada_standar_warna: 'Tidak',
    is_io_selesai: true,
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
  const [kalkulasiLoading, setKalkulasiLoading] = useState(false);
  const [selectedKalkulasiData, setSelectedKalkulasiData] =
    useState<KalkulasiData | null>(null);

  // Status Produk options
  const statusProdukOptions = [
    { value: 'OKP', label: 'OKP' },
    { value: 'PROFF', label: 'PROFF' },
    { value: 'ACC', label: 'ACC' },
  ];

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
        const options = response.data.data.map((item: KalkulasiData) => ({
          value: item.id,
          // Enhanced label with customer name and product name
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

  // Load Kalkulasi data when component mounts
  useEffect(() => {
    if (isOpen) {
      fetchKalkulasiData();
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof SOFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Handle Kalkulasi selection
    if (field === 'id_kalkulasi') {
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
                value: gudang.id.toString(),
                label: gudang.alamat_gudang,
                data: gudang,
              }),
            );
            setGudangOptions(gudangOpts);

            // Auto fill alamat_pengiriman with first gudang (index 0)
            const defaultGudang = kalkulasiData.customer.gudang[0];
            const defaultAlamat = defaultGudang
              ? defaultGudang.alamat_gudang
              : '';

            setFormData((prev) => ({
              ...prev,
              harga_jual: isNaN(hargaSatuanCustomer) ? 0 : hargaSatuanCustomer,
              total_harga: isNaN(hargaSatuanCustomer)
                ? 0
                : hargaSatuanCustomer * (qtyKalkulasi || 0),
              status_jo: kalkulasiData.status_kalkulasi,
              customer: kalkulasiData.nama_customer || '',
              produk: kalkulasiData.nama_produk || '',
              profit: profitValue, // Auto fill profit
              alamat_pengiriman: defaultAlamat, // Auto fill with first gudang
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
          }));
          setGudangOptions([]);
        }
      } else {
        setSelectedKalkulasiData(null);
        setGudangOptions([]);
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
    onSubmit(formData);
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
      ppn: '',
      profit: 0,
      tgl_pengiriman: '',
      alamat_pengiriman: '',
      ada_standar_warna: 'Tidak',
      is_io_selesai: true,
    });
    setSelectedKalkulasiData(null);
    setGudangOptions([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Create Sales Order</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            type="button"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Row 1 */}
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
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nomor SO</label>
              <input
                type="text"
                value={formData.no_so}
                onChange={(e) => handleInputChange('no_so', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">NOMOR IO</label>
              <SearchableSelect
                placeholder={kalkulasiLoading ? 'Loading...' : 'Pilih Data'}
                value={formData.id_kalkulasi}
                onChange={(value) => handleInputChange('id_kalkulasi', value)}
                options={kalkulasiOptions}
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
              />
            </div>

            {/* Row 2 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                No Booking
              </label>
              <SearchableSelect
                placeholder="Pilih Data"
                value={formData.no_booking}
                onChange={(value) => handleInputChange('no_booking', value)}
                options={[]} // Add your options here
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Status Job Order
              </label>
              <input
                type="text"
                value={formData.status_jo}
                className="w-full p-2 border border-gray-300 rounded bg-gray-100 focus:outline-none"
                readOnly
                placeholder="Auto filled from Kalkulasi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Customer</label>
              <input
                type="text"
                placeholder="Masukan Customer"
                value={formData.customer}
                onChange={(e) => handleInputChange('customer', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Row 3 */}
            <div>
              <label className="block text-sm font-medium mb-1">Produk</label>
              <input
                type="text"
                placeholder="Masukan Produk"
                value={formData.produk}
                onChange={(e) => handleInputChange('produk', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Status Produk
              </label>
              <SearchableSelect
                placeholder="Pilih Status Produk"
                value={formData.status_produk}
                onChange={(value) => handleInputChange('status_produk', value)}
                options={statusProdukOptions}
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
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Row 4 */}
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
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">PO Qty</label>
              <input
                type="number"
                placeholder="Masukan PO Quantity"
                value={formData.po_qty}
                onChange={(e) =>
                  handleInputChange('po_qty', parseInt(e.target.value) || 0)
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Row 5 */}
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
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Total Harga
              </label>
              <div className="w-full p-2 border border-gray-300 rounded bg-gray-100">
                {formData.total_harga.toLocaleString('id-ID')}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">PPN</label>
              <select
                value={formData.ppn}
                onChange={(e) => handleInputChange('ppn', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih PPN</option>
                <option value="yes">Ya</option>
                <option value="no">Tidak</option>
              </select>
            </div>

            {/* Row 6 */}
            <div>
              <label className="block text-sm font-medium mb-1">Profit</label>
              <input
                type="number"
                placeholder="Auto filled from Kalkulasi"
                value={formData.profit}
                onChange={(e) =>
                  handleInputChange('profit', parseInt(e.target.value) || 0)
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tanggal Pengiriman
              </label>
              <input
                type="date"
                value={formData.tgl_pengiriman}
                onChange={(e) =>
                  handleInputChange('tgl_pengiriman', e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nomor PO Customer
              </label>
              <input
                type="text"
                placeholder="Masukan Nomor PO Customer"
                value={formData.no_po_customer}
                onChange={(e) =>
                  handleInputChange('no_po_customer', e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Row 7 */}
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
              />
            </div>

            {/* Row 8 */}
            <div>
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
                    />
                    Tidak
                  </label>
                </div>
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
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create SO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SOCreatePopup;
