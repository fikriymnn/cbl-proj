// components/SODetailPopup.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SOData } from './types/SOTypes';
import SearchableSelect from '../../../../pages/MasterData/Marketing/SearchableSelect';

interface SODetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  data: SOData | null;
}

interface KelengkapanPOFormData {
  status_pemesanan: string;
  acuan_warna: string;
  artwork: string;
  harga: string;
  partial: string;
  kirim_semua: string;
  note: string;
  create_by: string;
  ppic: string;
}

const SODetailPopup: React.FC<SODetailPopupProps> = ({
  isOpen,
  onClose,
  data: initialData,
}) => {
  const [data, setData] = useState<SOData | null>(initialData);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [ppicOptions, setPpicOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [formData, setFormData] = useState<KelengkapanPOFormData>({
    status_pemesanan: '',
    acuan_warna: '',
    artwork: '',
    harga: '',
    partial: '',
    kirim_semua: '',
    note: '',
    create_by: '',
    ppic: '',
  });

  // Options for select fields
  const acuanWarnaOptions = [
    { value: 'Existing', label: 'Existing' },
    { value: 'PPCR ACC Customer', label: 'PPCR ACC Customer' },
    { value: 'Contoh Sample Customer', label: 'Contoh Sample Customer' },
    { value: 'Tidak Ada Acuan', label: 'Tidak Ada Acuan' },
    { value: 'Pantone/TC', label: 'Pantone/TC' },
  ];

  const artworkOptions = [
    { value: 'Ada', label: 'Ada' },
    { value: 'Belum ACC', label: 'Belum ACC' },
  ];

  const hargaOptions = [
    { value: 'OK', label: 'OK' },
    { value: 'Belum OK', label: 'Belum OK' },
  ];

  const partialOptions = [
    { value: 'YA', label: 'YA' },
    { value: 'TIDAK', label: 'TIDAK' },
  ];

  const kirimSemuaOptions = [
    { value: 'YA', label: 'YA' },
    { value: 'TIDAK', label: 'TIDAK' },
  ];

  // Update local data when initialData changes
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    if (isFormOpen) {
      fetchUserData();
      fetchPPICKaryawan();

      // Auto-fill form with existing data if available
      if (data) {
        setFormData((prev) => ({
          ...prev,
          status_pemesanan: data.status_jo || '',
          acuan_warna: data.acuan_warna || '',
          artwork: data.artwork || '',
          harga: data.harga || '',
          partial: data.partial || '',
          kirim_semua: data.kirim_semua || '',
          note: data.note || '',
          ppic: data.ppic || '',
          // create_by will be set by fetchUserData
        }));
      }
    }
    console.log(data);
  }, [isFormOpen, data]);

  // Function to refresh SO data
  const refreshSOData = async () => {
    if (!data?.id) return;

    try {
      const url = `${import.meta.env.VITE_API_LINK}/marketing/so/${data.id}`;
      const res = await axios.get(url, { withCredentials: true });

      if (res.data.succes && res.data.data) {
        setData(res.data.data);
        console.log('Refreshed SO data:', res.data.data);
      }
    } catch (error) {
      console.error('Error refreshing SO data:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const url = `${import.meta.env.VITE_API_LINK}/me`;
      const res = await axios.get(url, { withCredentials: true });
      console.log('user', res);

      if (res.data) {
        setFormData((prev) => ({
          ...prev,
          create_by: res.data.nama || '', // This should now correctly access nama
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchPPICKaryawan = async () => {
    try {
      const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;
      const res = await axios.get(url, {
        params: {},
        withCredentials: true,
      });

      const ppicKaryawan = res.data.data
        .filter((karyawan: any) => {
          if (
            !karyawan.biodata_karyawan ||
            karyawan.biodata_karyawan.length === 0
          ) {
            return false;
          }

          const biodata = karyawan.biodata_karyawan[0];
          return (
            biodata?.department?.nama_department ===
            'Planning Production Inventory Control'
          );
        })
        .map((karyawan: any) => ({
          value: karyawan.name,
          label: karyawan.name || karyawan.nama || karyawan.username,
        }));

      setPpicOptions(ppicKaryawan);
      console.log('PPIC Karyawan:', ppicKaryawan);
    } catch (error) {
      console.error('Error fetching PPIC karyawan:', error);
    }
  };

  const handleFormInputChange = (
    field: keyof KelengkapanPOFormData,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitKelengkapanPO = async () => {
    if (!data?.id) return;

    if (
      !formData.acuan_warna ||
      !formData.artwork ||
      !formData.harga ||
      !formData.partial ||
      !formData.kirim_semua ||
      !formData.ppic
    ) {
      alert('Mohon lengkapi semua field yang wajib diisi!');
      return;
    }

    if (
      window.confirm(
        'Apakah Anda yakin ingin submit Form Checklist Kelengkapan PO?',
      )
    ) {
      try {
        setFormLoading(true);
        const url = `${
          import.meta.env.VITE_API_LINK
        }/marketing/so/kelengkapanPo/${data.id}`;

        const res = await axios.put(
          url,
          {
            status_pemesanan: formData.status_pemesanan,
            acuan_warna: formData.acuan_warna,
            artwork: formData.artwork,
            harga: formData.harga,
            partial: formData.partial,
            kirim_semua: formData.kirim_semua,
            note: formData.note,
            create_by: formData.create_by,
            ppic: formData.ppic,
          },
          {
            withCredentials: true,
          },
        );
        console.log(res);
        if (res.data.succes) {
          alert('Form Checklist Kelengkapan PO berhasil disimpan!');
          setIsFormOpen(false);

          // Refresh the SO data to get updated kelengkapan PO data
          await refreshSOData();

          // Reset form
          setFormData({
            status_pemesanan: '',
            acuan_warna: '',
            artwork: '',
            harga: '',
            partial: '',
            kirim_semua: '',
            note: '',
            create_by: '',
            ppic: '',
          });
        }
      } catch (error: any) {
        console.error('Error submitting kelengkapan PO:', error);
        alert(
          'Gagal menyimpan Form Checklist Kelengkapan PO. Silakan coba lagi.',
        );
      } finally {
        setFormLoading(false);
      }
    }
  };

  if (!isOpen || !data) return null;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  // Check if kelengkapan PO data exists
  const hasKelengkapanPO =
    data.acuan_warna ||
    data.artwork ||
    data.harga ||
    data.partial ||
    data.kirim_semua ||
    data.ppic;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">Detail Sales Order</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              type="button"
            >
              ×
            </button>
          </div>
          <div className="px-4 py-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Form Checklist Kelengkapan PO
            </button>
          </div>
          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* All existing SO fields... */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Tanggal Input PO
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {formatDate(data.tgl_input_po)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Nomor SO
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {data.no_so || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Nomor IO
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {data.no_io || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  SO Cancel
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {data.so_cancel || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  No Booking
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {data.no_booking || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Status Job Order
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {data.status_jo || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Customer
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {data.customer || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Produk
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {data.produk || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Status Produk
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {data.status_produk || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Tanggal Acc Customer
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {formatDate(data.tgl_acc_customer)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Tanggal PO Customer
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {formatDate(data.tgl_po_customer)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  PO Qty
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {data.po_qty?.toLocaleString('id-ID') || '0'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Harga Jual
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {formatCurrency(data.harga_jual || 0)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Total Harga
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50 font-semibold">
                  {formatCurrency(data.total_harga)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  PPN
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {data.ppn || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Profit
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {data.profit || 0}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Tanggal Pengiriman
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {formatDate(data.tgl_pengiriman)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Nomor PO Customer
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {data.no_po_customer || '-'}
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Alamat Pengiriman
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {data.alamat_pengiriman || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Keterangan
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {data.keterangan || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Ada Standar Warna
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {data.ada_standar_warna || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  IO Selesai
                </label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50">
                  {data.is_io_selesai ? 'Ya' : 'Tidak'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Status
                </label>
                <div className="w-full p-2">
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium uppercase ${
                      data.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : data.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {data.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Kelengkapan PO Section - Display if data exists */}
            {hasKelengkapanPO && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Checklist Kelengkapan PO
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-blue-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Status Pemesanan
                    </label>
                    <div className="w-full p-2 border border-gray-200 rounded bg-white">
                      {data.status_pemesanan || '-'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Acuan Warna
                    </label>
                    <div className="w-full p-2 border border-gray-200 rounded bg-white">
                      {data.acuan_warna || '-'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Artwork
                    </label>
                    <div className="w-full p-2 border border-gray-200 rounded bg-white">
                      {data.artwork || '-'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Harga
                    </label>
                    <div className="w-full p-2 border border-gray-200 rounded bg-white">
                      {data.harga || '-'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Partial
                    </label>
                    <div className="w-full p-2 border border-gray-200 rounded bg-white">
                      {data.partial || '-'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Kirim Semua
                    </label>
                    <div className="w-full p-2 border border-gray-200 rounded bg-white">
                      {data.kirim_semua || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Dibuat Oleh
                    </label>
                    <div className="w-full p-2 border border-gray-200 rounded bg-white">
                      {data.create_by || '-'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      PPIC
                    </label>
                    <div className="w-full p-2 border border-gray-200 rounded bg-white">
                      {data.ppic || '-'}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Note
                    </label>
                    <div className="w-full p-2 border border-gray-200 rounded bg-white">
                      {data.note || '-'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Checklist Kelengkapan PO Modal - Keep existing code */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Form Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                Form Checklist Kelengkapan PO
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                type="button"
              >
                ×
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Pemesanan (Read-only from status_jo) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Pemesanan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.status_pemesanan}
                    disabled
                    className="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                  />
                </div>

                {/* Acuan Warna */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Acuan Warna <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    placeholder="Pilih Acuan Warna"
                    value={formData.acuan_warna}
                    onChange={(value) =>
                      handleFormInputChange('acuan_warna', String(value))
                    }
                    options={acuanWarnaOptions}
                  />
                </div>

                {/* Artwork */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Artwork <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    placeholder="Pilih Artwork"
                    value={formData.artwork}
                    onChange={(value) =>
                      handleFormInputChange('artwork', String(value))
                    }
                    options={artworkOptions}
                  />
                </div>

                {/* Harga */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    placeholder="Pilih Harga"
                    value={formData.harga}
                    onChange={(value) =>
                      handleFormInputChange('harga', String(value))
                    }
                    options={hargaOptions}
                  />
                </div>

                {/* Partial */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partial <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    placeholder="Pilih Partial"
                    value={formData.partial}
                    onChange={(value) =>
                      handleFormInputChange('partial', String(value))
                    }
                    options={partialOptions}
                  />
                </div>

                {/* Kirim Semua */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kirim Semua <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    placeholder="Pilih Kirim Semua"
                    value={formData.kirim_semua}
                    onChange={(value) =>
                      handleFormInputChange('kirim_semua', String(value))
                    }
                    options={kirimSemuaOptions}
                  />
                </div>

                {/* Dibuat Oleh (Read-only from /me) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dibuat Oleh
                  </label>
                  <input
                    type="text"
                    value={formData.create_by}
                    disabled
                    className="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                  />
                </div>

                {/* PPIC */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PPIC <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    placeholder="Pilih PPIC"
                    value={formData.ppic}
                    onChange={(value) =>
                      handleFormInputChange('ppic', String(value))
                    }
                    options={ppicOptions}
                  />
                </div>

                {/* Note (Full width) */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) =>
                      handleFormInputChange('note', e.target.value)
                    }
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan catatan..."
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitKelengkapanPO}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={formLoading}
                >
                  {formLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SODetailPopup;
