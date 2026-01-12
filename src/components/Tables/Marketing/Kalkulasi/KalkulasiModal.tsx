import React, { useEffect, useState } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';

import BasicInfoForm from './BasicInfoForm';
import TabNavigation from './TabNavigation';
import TabContent from './TabContent';
import ProfitSidebar from './ProfitSidedbar';
import {
  calculateHargaProduksi,
  calculateFinancialData,
  calculateLainLainTotal,
} from './utils/calulations';
import {
  KalkulasiFormData,
  KalkulasiModalProps,
  ApiResponse,
  QtyListItem,
  KalkulasiDetailItem,
} from '../Kalkulasi/types/kalkulasi';

const initialFormData: KalkulasiFormData = {
  tgl_kalkulasi: new Date().toISOString().split('T')[0],
  kode_kalkulasi: '',
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
  harga_pengiriman_awal: '0',
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
  lain_lain: [],
  total_harga_lain_lain: '0',
  tipe_kalkulasi: 'normal',
  label: '',
  qty_list: [{ qty: 0, is_selected: true }],
};

// Helper function to safely convert to string
const safeToString = (value: any, defaultValue: string = '0'): string => {
  if (value === null || value === undefined || value === '')
    return defaultValue;
  return String(value);
};
// const parseIndonesianNumber = (value: any): number => {
//   if (value === null || value === undefined || value === '') return 0;
//   if (typeof value === 'number') return value;

//   // Convert to string and handle Indonesian format
//   // Indonesian format: 1.234.567,89 (dots for thousands, comma for decimal)
//   let stringValue = String(value);

//   // Remove currency symbols and spaces
//   stringValue = stringValue.replace(/[Rp\s]/g, '');

//   // Replace dots (thousand separators) with empty string
//   stringValue = stringValue.replace(/\./g, '');

//   // Replace comma (decimal separator) with dot
//   stringValue = stringValue.replace(/,/g, '.');

//   const num = parseFloat(stringValue);
//   return isNaN(num) ? 0 : num;
// };
const convertDetailToFormData = (
  detail: KalkulasiDetailItem,
): KalkulasiFormData => {
  return {
    kode_kalkulasi: detail.kode_kalkulasi || '',
    tgl_kalkulasi: detail.tgl_kalkulasi.split('T')[0],
    status_kalkulasi: detail.status_kalkulasi,
    id_customer: detail.id_customer,
    id_marketing: detail.id_marketing,
    id_produk: detail.id_produk,
    id_area_pengiriman: detail.id_area_pengiriman,
    qty_kalkulasi: safeToString(detail.qty_kalkulasi),
    presentase_insheet: safeToString(detail.presentase_insheet),
    spesifikasi: detail.spesifikasi,
    ukuran_jadi_panjang: safeToString(detail.ukuran_jadi_panjang),
    ukuran_jadi_lebar: safeToString(detail.ukuran_jadi_lebar),
    ukuran_jadi_tinggi: safeToString(detail.ukuran_jadi_tinggi),
    ukuran_jadi_terb_panjang: safeToString(detail.ukuran_jadi_terb_panjang),
    ukuran_jadi_terb_lebar: safeToString(detail.ukuran_jadi_terb_lebar),
    ukuran_cetak_panjang_1: safeToString(detail.ukuran_cetak_panjang_1),
    ukuran_cetak_lebar_1: safeToString(detail.ukuran_cetak_lebar_1),
    ukuran_cetak_bagian_1: safeToString(detail.ukuran_cetak_bagian_1),
    ukuran_cetak_isi_1: safeToString(detail.ukuran_cetak_isi_1),
    ukuran_cetak_bbs_1: detail.ukuran_cetak_bbs_1,
    ukuran_cetak_panjang_2: safeToString(detail.ukuran_cetak_panjang_2),
    ukuran_cetak_lebar_2: safeToString(detail.ukuran_cetak_lebar_2),
    ukuran_cetak_bagian_2: safeToString(detail.ukuran_cetak_bagian_2),
    ukuran_cetak_isi_2: safeToString(detail.ukuran_cetak_isi_2),
    ukuran_cetak_bbs_2: detail.ukuran_cetak_bbs_2 || 'no',
    warna_depan: safeToString(detail.warna_depan),
    warna_belakang: safeToString(detail.warna_belakang),
    jumlah_warna: safeToString(detail.jumlah_warna),
    nama_customer: detail.nama_customer,
    nama_marketing: detail.nama_marketing,
    nama_area_pengiriman: detail.nama_area_pengiriman,
    nama_produk: detail.nama_produk,
    print_insheet: safeToString(detail.print_insheet),
    pons_insheet: safeToString(detail.pons_insheet),
    finishing_insheet: safeToString(detail.finishing_insheet),

    // Kertas
    id_kertas: detail.id_kertas,
    jenis_kertas: detail.jenis_kertas,
    gramature: detail.gramature_kertas,
    panjangMm: detail.panjang_kertas,
    lebarMm: detail.lebar_kertas,
    percentage: detail.persentase_kertas,
    apki: detail.persentase_apki_kertas,
    total_kertas: detail.total_kertas,
    total_harga_kertas: detail.total_harga_kertas,

    // Cetak
    id_jenis_mesin_cetak: detail.id_jenis_mesin_cetak,
    jumlah_harga_cetak: detail.jumlah_harga_cetak,
    harga_plate: safeToString(detail.harga_plate),

    // Coating
    id_coating_depan: detail.id_coating_depan,
    id_coating_belakang: detail.id_coating_belakang,
    id_mesin_coating_depan: detail.id_mesin_coating_depan,
    id_mesin_coating_belakang: detail.id_mesin_coating_belakang,
    jumlah_harga_coating_depan: detail.jumlah_harga_coating_depan,
    jumlah_harga_coating_belakang: detail.jumlah_harga_coating_belakang,
    total_harga_coating: detail.total_harga_coating,

    // PostPress
    id_jenis_pons: safeToString(detail.id_jenis_pons, ''),
    id_mesin_pons: safeToString(detail.id_mesin_pons, ''),
    harga_pisau: safeToString(detail.harga_pisau),
    ongkos_pons: detail.ongkos_pons,
    ongkos_pons_qty: safeToString(detail.ongkos_pons_qty),
    harga_satuan_ongkos_pons: safeToString(detail.harga_satuan_ongkos_pons),
    total_harga_ongkos_pons: safeToString(detail.total_harga_ongkos_pons),

    // Lipat
    lipat: detail.lipat,
    id_mesin_lipat: safeToString(detail.id_mesin_lipat, ''),
    qty_lipat: safeToString(detail.qty_lipat),
    harga_lipat: safeToString(detail.harga_lipat),

    // Potong
    potong_jadi: detail.potong_jadi,
    id_mesin_potong: safeToString(detail.id_mesin_potong, ''),
    qty_potong: safeToString(detail.qty_potong),
    harga_potong_jadi: safeToString(detail.harga_potong_jadi),

    // PostPress2 - Finishing & Lem
    id_lem: safeToString(detail.id_lem, ''),
    jumlah_harga_lem: safeToString(detail.jumlah_harga_lem),
    id_mesin_finishing: safeToString(detail.id_mesin_finishing, ''),

    // PostPress2 - Foil
    foil: detail.foil || null,
    spot_foil: detail.spot_foil || null,
    harga_foil_manual: safeToString(detail.harga_foil_manual),
    harga_spot_foil_manual: safeToString(detail.harga_spot_foil_manual),
    harga_polimer_manual: safeToString(detail.harga_polimer_manual),

    // PostPress2 - Packing
    jenis_packing: detail.jenis_packing || '',
    id_packing: safeToString(detail.id_packing, ''),
    qty_packing: safeToString(detail.qty_packing),
    harga_packing: safeToString(detail.harga_packing),
    harga_pengiriman_awal: safeToString(detail.harga_area_pengiriman),

    // PostPress2 - Packaging
    panjang_packaging: safeToString(detail.panjang_packaging, ''),
    lebar_packaging: safeToString(detail.lebar_packaging, ''),
    no_packaging: detail.no_packaging || '0.00',
    jumlah_kirim: safeToString(detail.jumlah_kirim),
    harga_packaging: safeToString(detail.harga_packaging),
    harga_pengiriman: safeToString(detail.harga_pengiriman),

    // Profit
    harga_produksi: safeToString(detail.harga_produksi),
    profit: safeToString(detail.profit),
    profit_harga: safeToString(detail.profit_harga),
    jumlah_harga_jual: safeToString(detail.jumlah_harga_jual),
    ppn: safeToString(detail.ppn),
    harga_ppn: safeToString(detail.harga_ppn),
    diskon: safeToString(detail.diskon),
    harga_diskon: safeToString(detail.harga_diskon),
    total_harga: safeToString(detail.total_harga),
    harga_satuan: safeToString(detail.harga_satuan),
    total_harga_satuan_customer: safeToString(
      detail.total_harga_satuan_customer,
    ),
    keterangan_harga: detail.keterangan_harga || '',
    keterangan_kerja: detail.keterangan_kerja || '',

    // Lain-lain
    lain_lain:
      detail.lain_lain?.map((item) => ({
        nama_item: item.nama_item,
        harga: item.harga,
      })) || [],
    total_harga_lain_lain: safeToString(
      detail.lain_lain?.reduce((sum, item) => sum + item.harga, 0),
    ),

    // Type
    tipe_kalkulasi:
      (detail.tipe_kalkulasi as 'normal' | 'multi' | 'manual') || 'normal',
    label: detail.label || '',
    qty_list: detail.qty_list || [
      { qty: detail.qty_kalkulasi, is_selected: true },
    ],
  };
};
const KalkulasiModal: React.FC<KalkulasiModalProps> = ({
  onClose,
  onSuccess,
  kalkulasiType = 'normal',
  editData,
  isEditMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<string>('ukuran-jadi');
  const [formData, setFormData] = useState<KalkulasiFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  useEffect(() => {
    if (isEditMode && editData) {
      const convertedData = convertDetailToFormData(editData);
      setFormData(convertedData);
    } else if (editData && !isEditMode) {
      // This is copy mode - editData exists but isEditMode is false
      const convertedData = convertDetailToFormData(editData);
      // Override fields for copy
      convertedData.kode_kalkulasi = '';
      convertedData.tgl_kalkulasi = new Date().toISOString().split('T')[0];
      convertedData.status_kalkulasi = 'baru';
      setFormData(convertedData);
    } else {
      setFormData((prev) => ({
        ...prev,
        tipe_kalkulasi: kalkulasiType,
      }));
    }
  }, [kalkulasiType, isEditMode, editData]);

  // Browser navigation warning for unsaved changes
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

  // Update handleQtyListChange function (around line 215)
  const handleQtyListChange = (newList: QtyListItem[]) => {
    setFormData((prev) => {
      const updated = { ...prev, qty_list: newList };

      // Update selected quantity
      const selectedQty = newList.find((item) => item.is_selected);
      if (selectedQty) {
        updated.qty_kalkulasi = selectedQty.qty.toString();

        // For multi type, also update total_harga_satuan_customer from selected qty
        if (updated.tipe_kalkulasi === 'multi') {
          updated.total_harga_satuan_customer = (
            selectedQty.harga_satuan_customer || 0
          ).toString();
        }

        // Recalculate financial data with new quantity
        const financialData = calculateFinancialData(updated);
        updated.profit_harga = safeToString(financialData.profit_harga);
        updated.jumlah_harga_jual = safeToString(
          financialData.jumlah_harga_jual,
        );
        updated.harga_ppn = safeToString(financialData.harga_ppn);
        updated.harga_diskon = safeToString(financialData.harga_diskon);
        updated.total_harga = safeToString(financialData.total_harga);
        updated.harga_satuan = safeToString(financialData.harga_satuan);
      }

      return updated;
    });
    setHasUnsavedChanges(true);
  };

  // Handle input changes with automatic recalculation
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let updated = { ...prev };

      // Handle lain_lain specially
      if (name === 'lain_lain') {
        try {
          updated.lain_lain = JSON.parse(value);
          // Recalculate lain_lain total
          const lainLainTotal = calculateLainLainTotal(updated.lain_lain);
          updated.total_harga_lain_lain = safeToString(lainLainTotal);
        } catch (error) {
          console.error('Error parsing lain_lain:', error);
          updated.lain_lain = [];
          updated.total_harga_lain_lain = '0';
        }
      } else {
        (updated as any)[name] = value;
      }

      // Always recalculate production cost
      const newHargaProduksi = calculateHargaProduksi(updated);
      updated.harga_produksi = safeToString(newHargaProduksi);

      // Always recalculate financial data
      const financialData = calculateFinancialData(updated);
      updated.profit_harga = safeToString(financialData.profit_harga);
      updated.jumlah_harga_jual = safeToString(financialData.jumlah_harga_jual);
      updated.harga_ppn = safeToString(financialData.harga_ppn);
      updated.harga_diskon = safeToString(financialData.harga_diskon);
      updated.total_harga = safeToString(financialData.total_harga);
      updated.harga_satuan = safeToString(financialData.harga_satuan);

      return updated;
    });

    setHasUnsavedChanges(true);
  };
  const safeToString = (value: any, defaultValue: string = '0'): string => {
    if (value === null || value === undefined || value === '')
      return defaultValue;
    return String(value);
  };
  // Handle form submission
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    // Determine URL based on edit or create mode
    const url =
      isEditMode && editData
        ? `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi/${editData.id}`
        : `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi`;

    // Validation: Check if customer unit price is set
    if (
      !formData.total_harga_satuan_customer ||
      formData.total_harga_satuan_customer === '' ||
      Number(formData.total_harga_satuan_customer) === 0
    ) {
      alert('Harga Satuan Customer Harus Diisi dan Tidak Boleh 0.');
      return;
    }

    // Additional validation for multi type
    if (formData.tipe_kalkulasi === 'multi') {
      if (!formData.label || formData.label === '') {
        alert('Label harus dipilih untuk kalkulasi multi.');
        return;
      }

      const hasSelectedQty = formData.qty_list?.some(
        (item) => item.is_selected,
      );
      if (!hasSelectedQty) {
        alert('Pilih salah satu quantity untuk kalkulasi multi.');
        return;
      }

      const hasEmptyQty = formData.qty_list?.some(
        (item) => !item.qty || item.qty <= 0,
      );
      if (hasEmptyQty) {
        alert('Semua quantity harus diisi dan lebih dari 0.');
        return;
      }
    }

    try {
      setIsSubmitting(true);

      // Convert string values to numbers for API submission
      const submitData = {
        ...formData,
        qty_kalkulasi: Number(formData.qty_kalkulasi),
        harga_produksi: Number(formData.harga_produksi),
        profit: Number(formData.profit),
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
        lain_lain: formData.lain_lain || [],
        total_harga_lain_lain: Number(formData.total_harga_lain_lain || 0),
        tipe_kalkulasi: formData.tipe_kalkulasi,
        label: formData.label || '',
        qty_list: formData.qty_list || [],
        harga_pengiriman_awal: Number(formData.harga_pengiriman_awal || 0),
        harga_pengiriman: Number(formData.harga_pengiriman || 0),
        jumlah_kirim: Number(formData.jumlah_kirim || 0),
      };

      console.log(
        `${isEditMode ? 'Updating' : 'Submitting'} kalkulasi data:`,
        submitData,
      );

      // Use PUT for edit, POST for create
      const res: AxiosResponse<ApiResponse> = isEditMode
        ? await axios.put(url, submitData, { withCredentials: true })
        : await axios.post(url, submitData, { withCredentials: true });

      if (
        res.data &&
        (res.data.succes || res.status === 200 || res.status === 201)
      ) {
        setHasUnsavedChanges(false);
        alert(`Kalkulasi berhasil ${isEditMode ? 'diupdate' : 'disimpan'}!`);
        onSuccess();
      } else {
        throw new Error('Failed to save data');
      }
    } catch (error) {
      console.error('Error submitting kalkulasi:', error);

      let errorMessage = 'Gagal menyimpan data. Silakan coba lagi.';

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;

        // Priority: API message
        if (axiosError.response?.data?.msg) {
          errorMessage = axiosError.response.data.msg;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel button
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

  return (
    <div className="fixed inset-0 bg-white z-50 flex">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold items-center">
                {isEditMode
                  ? 'Edit Kalkulasi'
                  : editData
                  ? 'Copy Kalkulasi'
                  : 'Tambah Kalkulasi Baru'}{' '}
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                    kalkulasiType === 'multi'
                      ? 'bg-green-500'
                      : kalkulasiType === 'manual'
                      ? 'bg-purple-500'
                      : 'bg-blue-400'
                  }`}
                >
                  Tipe: {kalkulasiType.toUpperCase()}
                </span>
              </h1>
            </div>
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
                  onQtyListChange={handleQtyListChange}
                  isEditMode={isEditMode}
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
            onCancel={handleCancelClick}
          />
        </div>
      </div>
    </div>
  );
};

export default KalkulasiModal;
