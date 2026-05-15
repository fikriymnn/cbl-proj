// components/EditSO.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchableSelect from '../../../../pages/MasterData/Marketing/SearchableSelect';
import { SOFormData, KalkulasiData, SOData, Gudang } from './types/SOTypes';

interface EditSOProps {
  isOpen: boolean;
  onClose: () => void;
  soData: SOData | null;
  onSuccess: () => void;
}

const EditSO: React.FC<EditSOProps> = ({
  isOpen,
  onClose,
  soData,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<SOFormData>({
    tgl_input_po: new Date().toISOString().split('T')[0],
    no_so: '',
    is_so_kanban: false,
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
    alamat_penagihan: '',
    ada_standar_warna: 'Tidak',
    is_io_selesai: false,
    note_cancel: '',
  });

  const [kalkulasiOptions, setKalkulasiOptions] = useState<
    Array<{
      value: string;
      label: string;
      data: KalkulasiData;
    }>
  >([]);
  const [gudangOptions, setGudangOptions] = useState<
    Array<{
      value: string;
      label: string;
      data: Gudang;
    }>
  >([]);
  const [kalkulasiLoading, setKalkulasiLoading] = useState(false);
  const [loadingSONumber, setLoadingSONumber] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedKalkulasiId, setSelectedKalkulasiId] = useState<string>('');
  const [selectedStatusJO, setSelectedStatusJO] = useState<string>('');
  const [selectedStatusProduk, setSelectedStatusProduk] = useState<string>('');
  const [selectedAlamatPengiriman, setSelectedAlamatPengiriman] =
    useState<string>('');

  const statusProdukOptions = [
    { value: 'OKP', label: 'OKP' },
    { value: 'PROOF', label: 'PROOF' },
    { value: 'ACC', label: 'ACC' },
  ];

  const statusJOOptions = [
    { value: 'baru', label: 'Baru' },
    { value: 'repeat', label: 'Repeat' },
    { value: 'repeat perubahan', label: 'Repeat Perubahan' },
  ];

  // Generate SO Number
  const generateSONumber = async () => {
    try {
      setLoadingSONumber(true);
      const url = `${import.meta.env.VITE_API_LINK}/marketing/soJumlahData`;
      const res = await axios.get(url, { withCredentials: true });
      const totalData = res.data.total_data || 0;
      const nextNumber = totalData + 1;
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);
      const formattedNumber = String(nextNumber).padStart(5, '0');
      const soNumber = `SO-${formattedNumber}/CBL/${month}${year}`;
      setFormData((prev) => ({ ...prev, no_so: soNumber }));
    } catch (error) {
      console.error('Error generating SO number:', error);
    } finally {
      setLoadingSONumber(false);
    }
  };

  // Fetch Kalkulasi data
  const fetchKalkulasiData = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi`;
    setKalkulasiLoading(true);
    try {
      const response = await axios.get(url, {
        params: { is_io_active: true },
        withCredentials: true,
      });
      console.log('Fetched Kalkulasi data for EditSO:', response.data);
      if (response.data.succes && response.data.data) {
        const groupedByIdIO = response.data.data.reduce(
          (acc: Record<string, KalkulasiData[]>, item: KalkulasiData) => {
            const idIO = item.id_io?.toString() || '';
            if (!acc[idIO]) acc[idIO] = [];
            acc[idIO].push(item);
            return acc;
          },
          {} as Record<string, KalkulasiData[]>,
        );

        const filteredData: KalkulasiData[] = [];
        Object.keys(groupedByIdIO).forEach((idIO) => {
          const items = groupedByIdIO[idIO];
          if (items.length > 1) {
            const baruItem = items.find(
              (item: KalkulasiData) =>
                item.status_kalkulasi?.toLowerCase() === 'baru',
            );
            filteredData.push(baruItem || items[0]);
          } else {
            filteredData.push(items[0]);
          }
        });

        const options = filteredData.map((item: KalkulasiData) => ({
          value: item.id.toString(),
          label: `${item.no_io} - ${item.nama_customer}, ${item.nama_produk}`,
          data: item,
        }));
        setKalkulasiOptions(options);

        // Auto-select if soData has id_kalkulasi
        if (soData?.id_kalkulasi) {
          const matchingOption = options.find(
            (opt) => opt.value === soData.id_kalkulasi.toString(),
          );
          if (matchingOption) {
            console.log('Auto-selecting kalkulasi:', matchingOption);
            setSelectedKalkulasiId(matchingOption.value);

            // Set gudang options
            if (matchingOption.data.customer?.gudang) {
              const gudangOpts = matchingOption.data.customer.gudang.map(
                (gudang: Gudang) => ({
                  value: gudang.alamat_gudang,
                  label: gudang.alamat_gudang,
                  data: gudang,
                }),
              );
              setGudangOptions(gudangOpts);
              console.log('Loaded gudang options:', gudangOpts);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching Kalkulasi data:', error);
    } finally {
      setKalkulasiLoading(false);
    }
  };

  // Initialize form with soData
  useEffect(() => {
    if (isOpen && soData) {
      console.log('Initializing EditSO with soData:', soData);
      generateSONumber();
      fetchKalkulasiData();

      setFormData({
        tgl_input_po: new Date().toISOString().split('T')[0],
        no_so: '',
        is_so_kanban: soData.is_so_kanban || false,
        id_kalkulasi: soData.id_kalkulasi || null,
        id_so_cancel: soData.id,
        so_cancel: soData.no_so || '',
        no_booking: soData.no_booking || '',
        status_jo: soData.status_jo || '',
        customer: soData.customer || '',
        produk: soData.produk || '',
        status_produk: soData.status_produk || '',
        tgl_acc_customer: soData.tgl_acc_customer || '',
        tgl_po_customer: soData.tgl_po_customer || '',
        po_qty: soData.po_qty || 0,
        harga_jual: soData.harga_jual || 0,
        total_harga: soData.total_harga || 0,
        no_po_customer: soData.no_po_customer || '',
        keterangan: soData.keterangan || '',
        ppn: soData.ppn || '',
        profit: soData.profit || 0,
        tgl_pengiriman: soData.tgl_pengiriman || '',
        alamat_pengiriman: soData.alamat_pengiriman || '',
        alamat_penagihan: soData.alamat_penagihan || '',
        ada_standar_warna: soData.ada_standar_warna || 'Tidak',
        is_io_selesai: soData.is_io_selesai || false,
        note_cancel: '',
      });

      setSelectedStatusJO(soData.status_jo || '');
      setSelectedStatusProduk(soData.status_produk || '');
      setSelectedAlamatPengiriman(soData.alamat_pengiriman || '');
    }
  }, [isOpen, soData]);

  const handleKalkulasiChange = (value: number | string) => {
    const stringValue = String(value);
    setSelectedKalkulasiId(stringValue);
    setFormData((prev) => ({
      ...prev,
      id_kalkulasi: parseInt(stringValue) || null,
    }));

    const selectedOption = kalkulasiOptions.find(
      (option) => option.value === stringValue,
    );
    if (selectedOption?.data) {
      const kalkulasiData = selectedOption.data;
      const hargaSatuanCustomer = parseFloat(
        kalkulasiData.total_harga_satuan_customer || '0',
      );
      const qtyKalkulasi = kalkulasiData.qty_kalkulasi || 0;

      if (kalkulasiData.customer?.gudang) {
        const gudangOpts = kalkulasiData.customer.gudang.map(
          (gudang: Gudang) => ({
            value: gudang.alamat_gudang,
            label: gudang.alamat_gudang,
            data: gudang,
          }),
        );
        setGudangOptions(gudangOpts);

        // Auto-select first gudang if alamat_pengiriman is not set
        if (gudangOpts.length > 0 && !formData.alamat_pengiriman) {
          setSelectedAlamatPengiriman(gudangOpts[0].value);
          setFormData((prev) => ({
            ...prev,
            alamat_pengiriman: gudangOpts[0].value,
          }));
        }
      }

      setFormData((prev) => ({
        ...prev,
        harga_jual: hargaSatuanCustomer,
        total_harga: hargaSatuanCustomer * (prev.po_qty || qtyKalkulasi),
        status_jo: kalkulasiData.status_kalkulasi || '',
        customer: kalkulasiData.nama_customer || '',
        produk: kalkulasiData.nama_produk || '',
        profit: kalkulasiData.profit || 0,
      }));
      setSelectedStatusJO(kalkulasiData.status_kalkulasi || '');
    }
  };

  const handleStatusJOChange = (value: number | string) => {
    const stringValue = String(value);
    setSelectedStatusJO(stringValue);
    setFormData((prev) => ({ ...prev, status_jo: stringValue }));
  };

  const handleStatusProdukChange = (value: number | string) => {
    const stringValue = String(value);
    setSelectedStatusProduk(stringValue);
    setFormData((prev) => ({ ...prev, status_produk: stringValue }));
  };

  const handleAlamatPengirimanChange = (value: number | string) => {
    const stringValue = String(value);
    setSelectedAlamatPengiriman(stringValue);
    setFormData((prev) => ({ ...prev, alamat_pengiriman: stringValue }));
  };

  const handleInputChange = (field: keyof SOFormData, value: any) => {
    if (field === 'no_so') return;

    setFormData((prev) => ({ ...prev, [field]: value }));

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const createUrl = `${import.meta.env.VITE_API_LINK}/marketing/so`;
      const submitData = {
        ...formData,
        id_so_cancel: soData?.id || null,
        so_cancel: soData?.no_so || '',
      };

      console.log('Submitting EditSO data:', submitData);
      const response = await axios.post(createUrl, submitData, {
        withCredentials: true,
      });

      if (response.data.succes) {
        alert('SO baru berhasil dibuat dari SO yang dibatalkan');
        onSuccess();
        onClose();
      } else {
        alert(
          'Gagal membuat SO: ' + (response.data.message || 'Unknown error'),
        );
      }
    } catch (error: any) {
      console.error('Error creating SO:', error);
      alert('Error: ' + (error.response?.data?.message || 'Terjadi kesalahan'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            Buat Sales Order Baru (dari Cancel)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                placeholder={
                  loadingSONumber ? 'Generating...' : 'Auto-generated'
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">NOMOR IO</label>
              <SearchableSelect
                placeholder={kalkulasiLoading ? 'Loading...' : 'Pilih Data'}
                value={selectedKalkulasiId}
                onChange={handleKalkulasiChange}
                options={kalkulasiOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                SO Cancel
              </label>
              <input
                type="text"
                value={formData.so_cancel}
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                No Booking
              </label>
              <input
                type="text"
                value={formData.no_booking}
                onChange={(e) =>
                  handleInputChange('no_booking', e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Status Job Order
              </label>
              <SearchableSelect
                placeholder="Pilih Status JO"
                value={selectedStatusJO}
                onChange={handleStatusJOChange}
                options={statusJOOptions}
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
                value={selectedStatusProduk}
                onChange={handleStatusProdukChange}
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

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Alamat Pengiriman
              </label>
              <SearchableSelect
                placeholder="Pilih Alamat Gudang"
                value={selectedAlamatPengiriman}
                onChange={handleAlamatPengirimanChange}
                options={gudangOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Note Cancel
              </label>
              <input
                type="text"
                placeholder="Alasan Cancel"
                value={formData.note_cancel}
                onChange={(e) =>
                  handleInputChange('note_cancel', e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

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
              <div>
                <label className="flex items-center space-x-2 pt-7">
                  <input
                    type="checkbox"
                    checked={formData.is_io_selesai}
                    onChange={(e) =>
                      handleInputChange('is_io_selesai', e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">IO Selesai</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
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
              {loading ? 'Creating...' : 'Create SO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSO;
