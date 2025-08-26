import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';

interface KalkulasiItem {
  id: number;
  kode_kalkulasi: string | null;
  status_kalkulasi: string;
  tgl_kalkulasi: string;
  nama_customer: string;
  nama_produk: string;
  qty_kalkulasi: number;
  harga_satuan: number;
  status: string;
  nama_marketing: string;
  spesifikasi: string;

  // Additional fields from API
  total_harga_satuan_customer: number;
  profit_harga: number;
  harga_produksi: number;
  total_harga: number;
  harga_ppn: number;
  harga_diskon: number;
  diskon: number;

  // Size fields
  ukuran_jadi_panjang: number;
  ukuran_jadi_lebar: number;
  ukuran_jadi_tinggi: number;
  ukuran_jadi_terb_panjang: number;
  ukuran_jadi_terb_lebar: number;

  // Print size fields
  ukuran_cetak_panjang_1: number;
  ukuran_cetak_lebar_1: number;
  ukuran_cetak_bagian_1: number;
  ukuran_cetak_isi_1: number;
  ukuran_cetak_bbs_1: string;
  ukuran_cetak_panjang_2?: number;
  ukuran_cetak_lebar_2?: number;
  ukuran_cetak_bagian_2?: number;
  ukuran_cetak_isi_2?: number;
  ukuran_cetak_bbs_2?: string;

  keterangan_harga?: string;
  keterangan_kerja?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface KalkulasiFormData {
  tgl_kalkulasi: string;
  status_kalkulasi: string;
  nama_customer: string;
  nama_marketing: string;
  nama_produk: string;
  nama_area_pengiriman: string;
  qty_kalkulasi: string;
  presentase_insheet: string;
  spesifikasi: string;

  // Ukuran Jadi Produk
  ukuran_jadi_panjang: string;
  ukuran_jadi_lebar: string;
  ukuran_jadi_tinggi: string;
  ukuran_jadi_terb_panjang: string;
  ukuran_jadi_terb_lebar: string;

  // Ukuran Cetak Produk
  ukuran_cetak_panjang_1: string;
  ukuran_cetak_lebar_1: string;
  ukuran_cetak_bagian_1: string;
  ukuran_cetak_isi_1: string;
  ukuran_cetak_bbs_1: string;
  ukuran_cetak_panjang_2: string;
  ukuran_cetak_lebar_2: string;
  ukuran_cetak_bagian_2: string;
  ukuran_cetak_isi_2: string;
  ukuran_cetak_bbs_2: string;

  // Profit calculations
  harga_produksi: string;
  profit_harga: string;
  jumlah_harga_jual: string;
  harga_ppn: string;
  diskon: string;
  harga_diskon: string;
  total_harga: string;
  harga_satuan: string;
  total_harga_satuan_customer: string;
  keterangan_harga: string;
  keterangan_kerja: string;
}

interface ApiResponse<T = any> {
  data: T;
  status_code: number;
  succes: boolean; // Note: API uses "succes" not "success"
}

interface ApiError {
  message: string;
  status?: number;
}

const KalkulasiNormal: React.FC = () => {
  const [data, setData] = useState<KalkulasiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('ukuran-jadi');
  const [formData, setFormData] = useState<KalkulasiFormData>({
    tgl_kalkulasi: new Date().toISOString().split('T')[0],
    status_kalkulasi: 'baru',
    nama_customer: '',
    nama_marketing: '',
    nama_produk: '',
    nama_area_pengiriman: '',
    qty_kalkulasi: '0',
    presentase_insheet: '',
    spesifikasi: '',
    ukuran_jadi_panjang: '0',
    ukuran_jadi_lebar: '0',
    ukuran_jadi_tinggi: '0',
    ukuran_jadi_terb_panjang: '0',
    ukuran_jadi_terb_lebar: '0',
    ukuran_cetak_panjang_1: '0',
    ukuran_cetak_lebar_1: '0',
    ukuran_cetak_bagian_1: '0',
    ukuran_cetak_isi_1: '0',
    ukuran_cetak_bbs_1: 'no',
    ukuran_cetak_panjang_2: '0',
    ukuran_cetak_lebar_2: '0',
    ukuran_cetak_bagian_2: '0',
    ukuran_cetak_isi_2: '0',
    ukuran_cetak_bbs_2: 'no',
    harga_produksi: '0',
    profit_harga: '0',
    jumlah_harga_jual: '0',
    harga_ppn: '0',
    diskon: '0',
    harga_diskon: '0',
    total_harga: '0',
    harga_satuan: '0',
    total_harga_satuan_customer: '0',
    keterangan_harga: '',
    keterangan_kerja: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchKalkulasiData();
  }, []);

  // Browser navigation warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent): string | void => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    const handlePopState = (e: PopStateEvent): void => {
      if (hasUnsavedChanges) {
        const confirmLeave = window.confirm(
          'You have unsaved changes. Are you sure you want to leave?',
        );
        if (!confirmLeave) {
          window.history.pushState('', '', window.location.pathname);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    if (showPopup) {
      window.history.pushState('', '', window.location.pathname);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, showPopup]);

  const fetchKalkulasiData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi`;
    try {
      setLoading(true);
      const res: AxiosResponse<ApiResponse<KalkulasiItem[]>> = await axios.get(
        url,
      );
      console.log('Fetched kalkulasi data:', res.data);
      if (res.data && res.data.data) {
        setData(res.data.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching kalkulasi data:', error);
      const apiError = error as ApiError;
      alert(`Error: ${apiError.message || 'Failed to fetch data'}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPopup = (): void => {
    setShowPopup(true);
    setHasUnsavedChanges(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    const url = `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi`;

    try {
      setIsSubmitting(true);

      const submitData = {
        ...formData,
        qty_kalkulasi: Number(formData.qty_kalkulasi),
        harga_produksi: Number(formData.harga_produksi),
        profit_harga: Number(formData.profit_harga),
        total_harga: Number(formData.total_harga),
        harga_satuan: Number(formData.harga_satuan),
        total_harga_satuan_customer: Number(
          formData.total_harga_satuan_customer,
        ),
        harga_ppn: Number(formData.harga_ppn),
        diskon: Number(formData.diskon),
        harga_diskon: Number(formData.harga_diskon),
        presentase_insheet: Number(formData.presentase_insheet),
        ukuran_jadi_panjang: Number(formData.ukuran_jadi_panjang),
        ukuran_jadi_lebar: Number(formData.ukuran_jadi_lebar),
        ukuran_jadi_tinggi: Number(formData.ukuran_jadi_tinggi),
        ukuran_jadi_terb_panjang: Number(formData.ukuran_jadi_terb_panjang),
        ukuran_jadi_terb_lebar: Number(formData.ukuran_jadi_terb_lebar),
        ukuran_cetak_panjang_1: Number(formData.ukuran_cetak_panjang_1),
        ukuran_cetak_lebar_1: Number(formData.ukuran_cetak_lebar_1),
        ukuran_cetak_bagian_1: Number(formData.ukuran_cetak_bagian_1),
        ukuran_cetak_isi_1: Number(formData.ukuran_cetak_isi_1),
        ukuran_cetak_panjang_2: Number(formData.ukuran_cetak_panjang_2),
        ukuran_cetak_lebar_2: Number(formData.ukuran_cetak_lebar_2),
        ukuran_cetak_bagian_2: Number(formData.ukuran_cetak_bagian_2),
        ukuran_cetak_isi_2: Number(formData.ukuran_cetak_isi_2),
      };

      const res: AxiosResponse<ApiResponse<KalkulasiItem>> = await axios.post(
        url,
        submitData,
      );

      if (
        res.data &&
        (res.data.succes || res.status === 200 || res.status === 201)
      ) {
        setShowPopup(false);
        setHasUnsavedChanges(false);
        setFormData({
          tgl_kalkulasi: new Date().toISOString().split('T')[0],
          status_kalkulasi: 'baru',
          nama_customer: '',
          nama_marketing: '',
          nama_produk: '',
          nama_area_pengiriman: '',
          qty_kalkulasi: '0',
          presentase_insheet: '',
          spesifikasi: '',
          ukuran_jadi_panjang: '0',
          ukuran_jadi_lebar: '0',
          ukuran_jadi_tinggi: '0',
          ukuran_jadi_terb_panjang: '0',
          ukuran_jadi_terb_lebar: '0',
          ukuran_cetak_panjang_1: '0',
          ukuran_cetak_lebar_1: '0',
          ukuran_cetak_bagian_1: '0',
          ukuran_cetak_isi_1: '0',
          ukuran_cetak_bbs_1: 'no',
          ukuran_cetak_panjang_2: '0',
          ukuran_cetak_lebar_2: '0',
          ukuran_cetak_bagian_2: '0',
          ukuran_cetak_isi_2: '0',
          ukuran_cetak_bbs_2: 'no',
          harga_produksi: '0',
          profit_harga: '0',
          jumlah_harga_jual: '0',
          harga_ppn: '0',
          diskon: '0',
          harga_diskon: '0',
          total_harga: '0',
          harga_satuan: '0',
          total_harga_satuan_customer: '0',
          keterangan_harga: '',
          keterangan_kerja: '',
        });
        fetchKalkulasiData();
        alert('Kalkulasi berhasil disimpan!');
      } else {
        throw new Error('Failed to save data');
      }
    } catch (error) {
      console.error('Error submitting kalkulasi:', error);
      const apiError = error as ApiError;
      alert(`Terjadi kesalahan: ${apiError.message || 'Failed to save data'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = (): void => {
    if (!isSubmitting) {
      const confirmCancel = window.confirm(
        'Data akan hilang. Apakah Anda yakin ingin membatalkan?',
      );
      if (confirmCancel) {
        setShowPopup(false);
        setHasUnsavedChanges(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <span>Show</span>
          <select className="border border-gray-300 rounded px-2 py-1">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          <span>entries</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Search:</span>
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kode
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status Item Produk
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tanggal Kalkulasi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Produk
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Qty
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Harga Per PCS
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status Approval
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length > 0 ? (
                data.map((item: KalkulasiItem, index: number) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs">
                      <button className="bg-orange-500 text-white rounded-full w-6 h-6 text-xs">
                        !
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs">{index + 1}</td>
                    <td className="px-4 py-3 text-xs">
                      {item.kode_kalkulasi || '-'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {item.status_kalkulasi}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(item.tgl_kalkulasi).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-xs">{item.nama_customer}</td>
                    <td className="px-4 py-3 text-xs max-w-xs truncate">
                      {item.nama_produk}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {item.qty_kalkulasi?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      Rp {item.harga_satuan?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">-</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={11}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Tidak ada data kalkulasi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Kalkulasi Button */}
      <div className="mt-6">
        <button
          onClick={handleOpenPopup}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
          type="button"
        >
          + KALKULASI
        </button>
      </div>

      {/* Full Screen Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-white z-50 flex">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 shadow-lg">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Tambah Kalkulasi Baru</h1>
                <button
                  type="button"
                  onClick={handleCancelClick}
                  className="text-white hover:text-gray-200 transition-colors"
                  disabled={isSubmitting}
                >
                  <svg
                    className="w-8 h-8"
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

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel - Form Content */}
              <div className="flex-1 overflow-y-auto bg-gray-50">
                <div className="max-w-6xl mx-auto p-8">
                  <form
                    id="kalkulasi-form"
                    onSubmit={handleSubmit}
                    className="space-y-8"
                  >
                    {/* Basic Information Card */}
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
                            onChange={handleInputChange}
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
                            onChange={handleInputChange}
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
                          <select
                            name="nama_customer"
                            value={formData.nama_customer}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                          >
                            <option value="">Pilih Customer</option>
                            <option value="PT TROPICA MAS PHARMACEUTICALS">
                              PT TROPICA MAS PHARMACEUTICALS
                            </option>
                            <option value="TRIMAN">TRIMAN</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-gray-700">
                            Marketing
                          </label>
                          <select
                            name="nama_marketing"
                            value={formData.nama_marketing}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                          >
                            <option value="">Pilih Marketing</option>
                            <option value="Marketing 1">Marketing 1</option>
                            <option value="Marketing 2">Marketing 2</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-gray-700">
                            Produk
                          </label>
                          <select
                            name="nama_produk"
                            value={formData.nama_produk}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                          >
                            <option value="">Pilih Produk</option>
                            <option value="DUS ZULTROP SUSPENSI 60 ML">
                              DUS ZULTROP SUSPENSI 60 ML
                            </option>
                            <option value="BROSUR MELOXICAM">
                              BROSUR MELOXICAM
                            </option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-gray-700">
                            Area Pengiriman
                          </label>
                          <select
                            name="nama_area_pengiriman"
                            value={formData.nama_area_pengiriman}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          >
                            <option value="">Pilih Area Pengiriman</option>
                            <option value="Jakarta">Jakarta</option>
                            <option value="Bandung">Bandung</option>
                            <option value="Surabaya">Surabaya</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-gray-700">
                            Qty
                          </label>
                          <input
                            type="number"
                            name="qty_kalkulasi"
                            value={formData.qty_kalkulasi}
                            onChange={handleInputChange}
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
                            onChange={handleInputChange}
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
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Masukkan spesifikasi produk..."
                        />
                      </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                      <div className="border-b border-gray-200">
                        <div className="flex flex-wrap px-6">
                          {[
                            {
                              id: 'ukuran-jadi',
                              label: 'Ukuran Jadi Produk',
                              icon: '📏',
                            },
                            { id: 'warna', label: 'Warna', icon: '🎨' },
                            { id: 'prepress', label: 'Prepress', icon: '📋' },
                            { id: 'press', label: 'Press', icon: '🖨️' },
                            {
                              id: 'post-press',
                              label: 'Post Press',
                              icon: '✂️',
                            },
                            { id: 'postpress', label: 'Postpress', icon: '📦' },
                            {
                              id: 'lain-lain',
                              label: 'Lain - lain',
                              icon: '⚙️',
                            },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setActiveTab(tab.id)}
                              className={`flex items-center px-4 py-4 border-b-2 font-medium text-xs transition-all ${
                                activeTab === tab.id
                                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <span className="mr-2">{tab.icon}</span>
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tab Content */}
                      <div className="p-6">
                        {activeTab === 'ukuran-jadi' && (
                          <div className="space-y-8">
                            <div>
                              <h3 className="text- font-semibold text-blue-600 mb-6 flex items-center">
                                <svg
                                  className="w-5 h-5 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                  />
                                </svg>
                                Ukuran Jadi Produk
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {[
                                  {
                                    name: 'ukuran_jadi_panjang',
                                    label: 'Panjang mm',
                                    value: formData.ukuran_jadi_panjang,
                                  },
                                  {
                                    name: 'ukuran_jadi_lebar',
                                    label: 'Lebar mm',
                                    value: formData.ukuran_jadi_lebar,
                                  },
                                  {
                                    name: 'ukuran_jadi_tinggi',
                                    label: 'Tinggi mm',
                                    value: formData.ukuran_jadi_tinggi,
                                  },
                                  {
                                    name: 'ukuran_jadi_terb_panjang',
                                    label: 'Terb. Panjang mm',
                                    value: formData.ukuran_jadi_terb_panjang,
                                  },
                                  {
                                    name: 'ukuran_jadi_terb_lebar',
                                    label: 'Terb. Lebar mm',
                                    value: formData.ukuran_jadi_terb_lebar,
                                  },
                                ].map((field) => (
                                  <div key={field.name} className="space-y-2">
                                    <label className="block text-xs font-medium text-gray-700">
                                      {field.label}
                                    </label>
                                    <input
                                      type="number"
                                      name={field.name}
                                      value={field.value}
                                      onChange={handleInputChange}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                      min="0"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h3 className="text- font-semibold text-blue-600 mb-2 flex items-center">
                                <svg
                                  className="w-5 h-5 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                  />
                                </svg>
                                Ukuran Cetak Produk
                              </h3>

                              {/* First Print Row */}
                              <div className="mb-2">
                                <h4 className="text-md font-medium text-gray-700 mb-1">
                                  Cetak 1
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                  {[
                                    {
                                      name: 'ukuran_cetak_panjang_1',
                                      label: 'Panjang mm',
                                      value: formData.ukuran_cetak_panjang_1,
                                      type: 'number',
                                    },
                                    {
                                      name: 'ukuran_cetak_lebar_1',
                                      label: 'Lebar mm',
                                      value: formData.ukuran_cetak_lebar_1,
                                      type: 'number',
                                    },
                                    {
                                      name: 'ukuran_cetak_bagian_1',
                                      label: 'Bagian',
                                      value: formData.ukuran_cetak_bagian_1,
                                      type: 'number',
                                    },
                                    {
                                      name: 'ukuran_cetak_isi_1',
                                      label: 'Isi',
                                      value: formData.ukuran_cetak_isi_1,
                                      type: 'number',
                                    },
                                    {
                                      name: 'ukuran_cetak_bbs_1',
                                      label: 'BBS',
                                      value: formData.ukuran_cetak_bbs_1,
                                      type: 'select',
                                    },
                                  ].map((field) => (
                                    <div key={field.name} className="space-y-2">
                                      <label className="block text-xs font-medium text-gray-700">
                                        {field.label}
                                      </label>
                                      {field.type === 'select' ? (
                                        <select
                                          name={field.name}
                                          value={field.value}
                                          onChange={handleInputChange}
                                          className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                          <option value="No">No</option>
                                          <option value="Yes">Yes</option>
                                        </select>
                                      ) : (
                                        <input
                                          type="number"
                                          name={field.name}
                                          value={field.value}
                                          onChange={handleInputChange}
                                          className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                          min="0"
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Second Print Row */}
                              <div>
                                <h4 className="text-md font-medium text-gray-700 mb-1">
                                  Cetak 2
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                  {[
                                    {
                                      name: 'ukuran_cetak_panjang_2',
                                      label: 'Panjang mm',
                                      value: formData.ukuran_cetak_panjang_2,
                                      type: 'number',
                                    },
                                    {
                                      name: 'ukuran_cetak_lebar_2',
                                      label: 'Lebar mm',
                                      value: formData.ukuran_cetak_lebar_2,
                                      type: 'number',
                                    },
                                    {
                                      name: 'ukuran_cetak_bagian_2',
                                      label: 'Bagian',
                                      value: formData.ukuran_cetak_bagian_2,
                                      type: 'number',
                                    },
                                    {
                                      name: 'ukuran_cetak_isi_2',
                                      label: 'Isi',
                                      value: formData.ukuran_cetak_isi_2,
                                      type: 'number',
                                    },
                                    {
                                      name: 'ukuran_cetak_bbs_2',
                                      label: 'BBS',
                                      value: formData.ukuran_cetak_bbs_2,
                                      type: 'select',
                                    },
                                  ].map((field) => (
                                    <div key={field.name} className="space-y-2">
                                      <label className="block text-xs font-medium text-gray-700">
                                        {field.label}
                                      </label>
                                      {field.type === 'select' ? (
                                        <select
                                          name={field.name}
                                          value={field.value}
                                          onChange={handleInputChange}
                                          className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                          <option value="No">No</option>
                                          <option value="Yes">Yes</option>
                                        </select>
                                      ) : (
                                        <input
                                          type="number"
                                          name={field.name}
                                          value={field.value}
                                          onChange={handleInputChange}
                                          className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                          min="0"
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Other tabs with placeholder content */}
                        {activeTab !== 'ukuran-jadi' && (
                          <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                              <div className="text-6xl mb-4">🚧</div>
                              <h3 className="text- font-medium text-gray-600 mb-2">
                                Konten{' '}
                                {activeTab.charAt(0).toUpperCase() +
                                  activeTab.slice(1)}
                              </h3>
                              <p className="text-gray-500">
                                Akan segera ditambahkan
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Work Notes Card */}
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Keterangan Kerja
                      </h2>
                      <textarea
                        name="keterangan_kerja"
                        value={formData.keterangan_kerja}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Masukkan keterangan Kerja dan informasi tambahan..."
                      />
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Sidebar - Profit Calculator */}
              <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-lg">
                {/* Sidebar Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
                  <h2 className="text-xs font-bold flex items-center">
                    <svg
                      className="w-6 h-6 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                    Kalkulasi Profit
                  </h2>
                </div>

                {/* Profit Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Production Cost Section */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      Biaya Produksi
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Harga Produksi
                        </label>
                        <div className="bg-white px-2 py-1 rounded border text- font-semibold text-blue-600">
                          Rp {Number(formData.harga_produksi).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Profit Harga
                        </label>
                        <div className="bg-white px-2 py-1 rounded border text- font-semibold text-green-600">
                          Rp {Number(formData.profit_harga).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selling Price Section */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-4 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      Harga Jual
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Jumlah Harga Jual
                        </label>
                        <div className="bg-white px-2 py-1 rounded border text- font-semibold text-green-600">
                          Rp{' '}
                          {Number(formData.jumlah_harga_jual).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          PPN (11%)
                        </label>
                        <div className="bg-white px-2 py-1 rounded border text- font-semibold text-orange-600">
                          Rp {Number(formData.harga_ppn).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Discount Section */}
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-800 mb-4 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      Diskon & Penyesuaian
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Diskon (%)
                        </label>
                        <input
                          type="number"
                          name="diskon"
                          value={formData.diskon}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nilai Diskon
                        </label>
                        <div className="bg-white px-2 py-1 rounded border text- font-semibold text-red-600">
                          Rp {Number(formData.harga_diskon).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Final Price Section */}
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 border-2 border-purple-200">
                    <h3 className="font-bold text-purple-800 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      Total Akhir
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Total Harga
                        </label>
                        <div className="bg-white px-2 py-1 rounded border-2 border-purple-300 text-xs font-bold text-purple-700">
                          Rp {Number(formData.total_harga).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Harga per Unit
                        </label>
                        <div className="bg-white px-2 py-1 rounded border text- font-semibold text-purple-600">
                          Rp {Number(formData.harga_satuan).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Price Highlight */}
                  <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg p-4 border-2 border-yellow-300">
                    <h3 className="font-bold text-yellow-800 mb-3 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Harga untuk Customer
                    </h3>
                    <div className="bg-yellow-300 px-2 py-1 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-900">
                        Rp{' '}
                        {Number(
                          formData.total_harga_satuan_customer,
                        ).toLocaleString()}
                      </div>
                      <div className="text-xs text-yellow-700 mt-1">
                        per unit
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Ringkasan
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">
                          {Number(formData.qty_kalkulasi).toLocaleString()} pcs
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer:</span>
                        <span className="font-medium text-right max-w-32 truncate">
                          {formData.nama_customer || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Produk:</span>
                        <span className="font-medium text-right max-w-32 truncate">
                          {formData.nama_produk || '-'}
                        </span>
                      </div>
                      {formData.diskon && Number(formData.diskon) > 0 && (
                        <div className="flex justify-between text-orange-600">
                          <span>Diskon:</span>
                          <span className="font-medium">
                            {formData.diskon}%
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Work Notes Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-2 mt-4">
                      <h2 className="text-xs font-semibold text-gray-800 mb-2 flex items-center">
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Keterangan Harga
                      </h2>
                      <textarea
                        name="keterangan_harga"
                        value={formData.keterangan_harga}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Masukkan keterangan Harga dan informasi tambahan..."
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="space-y-3">
                    <button
                      type="submit"
                      form="kalkulasi-form"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Menyimpan...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Simpan Kalkulasi
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelClick}
                      disabled={isSubmitting}
                      className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-center">
                        <svg
                          className="w-5 h-5 mr-2"
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
                        Batal
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KalkulasiNormal;
