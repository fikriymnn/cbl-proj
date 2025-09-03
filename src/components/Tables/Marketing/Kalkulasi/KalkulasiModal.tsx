import React, { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import BasicInfoForm from './BasicInfoForm';
import TabNavigation from './TabNavigation';
import TabContent from './TabContent';
import ProfitSidebar from './ProfitSidedbar';
import {
  calculateHargaProduksi,
  calculateFinancialData,
  PRODUCTION_COST_FIELDS,
  FINANCIAL_FIELDS,
} from './utils/calulations';

export interface KalkulasiFormData {
  tgl_kalkulasi: string;
  status_kalkulasi: string;
  id_customer: number;
  id_marketing: number;
  nama_customer: string;
  nama_marketing: string;
  id_produk: number;
  id_area_pengiriman: number;
  qty_kalkulasi: string;

  presentase_insheet: string;
  nama_area_pengiriman: string;
  harga_pengiriman_awal?: string;
  nama_produk: string;

  print_insheet?: string;
  pons_insheet?: string;
  finishing_insheet?: string;
  spesifikasi: string;
  ukuran_jadi_panjang: string;
  ukuran_jadi_lebar: string;
  ukuran_jadi_tinggi: string;
  ukuran_jadi_terb_panjang: string;
  ukuran_jadi_terb_lebar: string;
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

  warna_depan: string;
  warna_belakang: string;
  jumlah_warna: string;
  ppn: string;

  gramature?: number;
  panjangMm?: number;
  lebarMm?: number;
  percentage?: number;
  apki?: number;
  total_kertas?: number;
  total_harga_kertas?: number;
  rawPercentage?: number | string;
  jumlah_harga_cetak?: number;

  jenis_kertas?: any;
  id_kertas?: number | string;

  id_jenis_mesin_cetak?: any;
  id_coating_depan?: any;
  id_coating_belakang?: any;
  id_mesin_coating_depan?: any;
  id_mesin_coating_belakang?: any;
  id_mesin_potong?: string;
  harga_plate?: string;

  // Add coating price fields
  jumlah_harga_coating_depan?: number;
  jumlah_harga_coating_belakang?: number;
  total_harga_coating?: number;

  // PostPress fields
  id_jenis_pons?: string;
  id_mesin_pons?: string;
  harga_pisau?: string;
  ongkos_pons?: string;
  ongkos_pons_qty?: string;
  harga_satuan_ongkos_pons?: string;
  total_harga_ongkos_pons?: string;

  // Lipat fields
  lipat?: string;
  id_mesin_lipat?: string;
  qty_lipat?: string;
  harga_lipat?: string;

  // Potong Jadi fields
  potong_jadi?: string;
  qty_potong?: string;
  harga_potong_jadi?: string;

  // PostPress2 fields
  id_lem?: string;
  jumlah_harga_lem?: string;
  id_mesin_finishing?: string;
  foil?: string;
  spot_foil?: string;
  harga_foil_manual?: string;
  harga_spot_foil_manual?: string;
  harga_polimer_manual?: string;

  //package
  panjang_packaging?: string;
  lebar_packaging?: string;
  no_packaging?: string;
  jumlah_kirim?: string;
  harga_packaging?: string;
  harga_pengiriman?: string;
  jenis_packing?: string;
  id_packing?: string;
  qty_packing?: string;
  harga_packing?: string;

  //profit bar
  harga_produksi: string;
  profit: string; // NEW: Profit percentage
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

  //lain lain
  lain_lain?: Array<{
    nama_item: string;
    harga: number;
  }>;
  total_harga_lain_lain?: string; // Add calculated total
}

interface ApiResponse<T = any> {
  data: T;
  status_code: number;
  succes: boolean;
}

interface KalkulasiModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const initialFormData: KalkulasiFormData = {
  tgl_kalkulasi: new Date().toISOString().split('T')[0],
  status_kalkulasi: 'baru',
  id_customer: 0,
  id_marketing: 0,
  id_produk: 0,
  id_area_pengiriman: 0,
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
  ppn: '0',
  diskon: '0',
  harga_diskon: '0',
  total_harga: '0',
  harga_satuan: '0',
  total_harga_satuan_customer: '0',
  keterangan_harga: '',
  keterangan_kerja: '',
  warna_depan: '0',
  warna_belakang: '0',
  jumlah_warna: '0',
  nama_customer: '',
  nama_marketing: '',
  nama_area_pengiriman: '',
  nama_produk: '',
  profit: '',
  lain_lain: [], // Add initial empty array
  total_harga_lain_lain: '0', // Add initial total
};

const KalkulasiModal: React.FC<KalkulasiModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<string>('ukuran-jadi');
  const [formData, setFormData] = useState<KalkulasiFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

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
    window.history.pushState('', '', window.location.pathname);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let updated = { ...prev };

      // Special handling for lain_lain array
      if (name === 'lain_lain') {
        try {
          // Parse the JSON string back to array
          updated.lain_lain = JSON.parse(value);
        } catch (error) {
          console.error('Error parsing lain_lain:', error);
          updated.lain_lain = [];
        }
      } else {
        // Regular field handling
        (updated as any)[name] = value;
      }

      // Check if the changed field affects production cost
      if (PRODUCTION_COST_FIELDS.includes(name)) {
        const newHargaProduksi = calculateHargaProduksi(updated);
        updated.harga_produksi = newHargaProduksi.toString();
      }

      // Check if any financial field changed, then recalculate all financial data
      if (
        PRODUCTION_COST_FIELDS.includes(name) ||
        FINANCIAL_FIELDS.includes(name)
      ) {
        const financialData = calculateFinancialData(updated);

        // Update all calculated fields
        updated.harga_produksi = financialData.harga_produksi.toString();
        updated.jumlah_harga_jual = financialData.jumlah_harga_jual.toString();
        updated.harga_ppn = financialData.harga_ppn.toString();
        updated.harga_diskon = financialData.harga_diskon.toString();
        updated.total_harga = financialData.total_harga.toString();
        updated.harga_satuan = financialData.harga_satuan.toString();
        updated.total_harga_satuan_customer =
          financialData.total_harga_satuan_customer.toString();
      }

      return updated;
    });

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
        profit: Number(formData.profit), // NEW: Profit percentage
        profit_harga: Number(formData.profit_harga), // CHANGED: Now calculated profit amount
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
        // Include lain_lain in submission
        lain_lain: formData.lain_lain || [],
        total_harga_lain_lain: Number(formData.total_harga_lain_lain || 0),
      };

      const res: AxiosResponse<ApiResponse> = await axios.post(url, submitData);

      if (
        res.data &&
        (res.data.succes || res.status === 200 || res.status === 201)
      ) {
        setHasUnsavedChanges(false);
        alert('Kalkulasi berhasil disimpan!');
        onSuccess();
      } else {
        throw new Error('Failed to save data');
      }
    } catch (error) {
      console.error('Error submitting kalkulasi:', error);
      alert(
        `Terjadi kesalahan: ${(error as any).message || 'Failed to save data'}`,
      );
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
        setHasUnsavedChanges(false);
        onClose();
      }
    }
  };

  useEffect(() => {
    const newHargaProduksi = calculateHargaProduksi(formData);
    const currentHargaProduksi = formData.harga_produksi
      ? parseFloat(formData.harga_produksi.toString().replace(/[Rp.\s,]/g, ''))
      : 0;

    if (currentHargaProduksi !== newHargaProduksi) {
      setFormData((prev) => ({
        ...prev,
        harga_produksi: newHargaProduksi.toString(),
      }));
    }
  }, [
    formData.total_harga_kertas,
    formData.jumlah_harga_cetak,
    formData.harga_plate,
    formData.total_harga_coating,
    formData.total_harga_ongkos_pons,
    formData.harga_pisau,
    formData.harga_lipat,
    formData.harga_potong_jadi,
    formData.jumlah_harga_lem,
    formData.harga_foil_manual,
    formData.harga_spot_foil_manual,
    formData.harga_polimer_manual,
    formData.total_harga_lain_lain, // Add this dependency
    formData.lain_lain, // Add this dependency
  ]);

  useEffect(() => {
    const financialData = calculateFinancialData(formData);

    // Only update if values have actually changed to avoid infinite loops
    const needsUpdate =
      parseFloat(formData.profit_harga || '0') !== financialData.profit_harga ||
      parseFloat(formData.jumlah_harga_jual || '0') !==
        financialData.jumlah_harga_jual ||
      parseFloat(formData.harga_ppn || '0') !== financialData.harga_ppn ||
      parseFloat(formData.harga_diskon || '0') !== financialData.harga_diskon ||
      parseFloat(formData.total_harga || '0') !== financialData.total_harga ||
      parseFloat(formData.harga_satuan || '0') !== financialData.harga_satuan;

    if (needsUpdate) {
      setFormData((prev) => ({
        ...prev,
        profit_harga: financialData.profit_harga.toString(), // CHANGED: Now calculated amount
        jumlah_harga_jual: financialData.jumlah_harga_jual.toString(),
        harga_ppn: financialData.harga_ppn.toString(),
        harga_diskon: financialData.harga_diskon.toString(),
        total_harga: financialData.total_harga.toString(),
        harga_satuan: financialData.harga_satuan.toString(),
        total_harga_satuan_customer:
          financialData.total_harga_satuan_customer.toString(),
      }));
    }
  }, [
    formData.harga_produksi,
    formData.profit, // CHANGED: Now 'profit' instead of 'profit_harga'
    formData.ppn,
    formData.diskon,
    formData.qty_kalkulasi,
  ]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex">
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
                <BasicInfoForm
                  formData={formData}
                  onInputChange={handleInputChange}
                />

                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <TabNavigation
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                  <TabContent
                    activeTab={activeTab}
                    formData={formData}
                    onInputChange={handleInputChange}
                  />
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

          {/* Right Sidebar */}
          <ProfitSidebar
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onCancel={handleCancelClick} // Fix this function reference
          />
        </div>
      </div>
    </div>
  );
};

export default KalkulasiModal;
