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
    qty_kalkulasi: detail.qty_kalkulasi.toString(),
    presentase_insheet: detail.presentase_insheet.toString(),
    spesifikasi: detail.spesifikasi,
    ukuran_jadi_panjang: detail.ukuran_jadi_panjang.toString(),
    ukuran_jadi_lebar: detail.ukuran_jadi_lebar.toString(),
    ukuran_jadi_tinggi: detail.ukuran_jadi_tinggi.toString(),
    ukuran_jadi_terb_panjang: detail.ukuran_jadi_terb_panjang.toString(),
    ukuran_jadi_terb_lebar: detail.ukuran_jadi_terb_lebar.toString(),
    ukuran_cetak_panjang_1: detail.ukuran_cetak_panjang_1.toString(),
    ukuran_cetak_lebar_1: detail.ukuran_cetak_lebar_1.toString(),
    ukuran_cetak_bagian_1: detail.ukuran_cetak_bagian_1.toString(),
    ukuran_cetak_isi_1: detail.ukuran_cetak_isi_1.toString(),
    ukuran_cetak_bbs_1: detail.ukuran_cetak_bbs_1,
    ukuran_cetak_panjang_2: detail.ukuran_cetak_panjang_2?.toString() || '0',
    ukuran_cetak_lebar_2: detail.ukuran_cetak_lebar_2?.toString() || '0',
    ukuran_cetak_bagian_2: detail.ukuran_cetak_bagian_2?.toString() || '0',
    ukuran_cetak_isi_2: detail.ukuran_cetak_isi_2?.toString() || '0',
    ukuran_cetak_bbs_2: detail.ukuran_cetak_bbs_2 || 'no',
    warna_depan: detail.warna_depan.toString(),
    warna_belakang: detail.warna_belakang.toString(),
    jumlah_warna: detail.jumlah_warna.toString(),
    nama_customer: detail.nama_customer,
    nama_marketing: detail.nama_marketing,
    nama_area_pengiriman: detail.nama_area_pengiriman,
    nama_produk: detail.nama_produk,
    print_insheet: detail.print_insheet?.toString(),
    pons_insheet: detail.pons_insheet?.toString(),
    finishing_insheet: detail.finishing_insheet?.toString() || '0',

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
    harga_plate: detail.harga_plate.toString(),

    // Coating
    id_coating_depan: detail.id_coating_depan,
    id_coating_belakang: detail.id_coating_belakang,
    id_mesin_coating_depan: detail.id_mesin_coating_depan,
    id_mesin_coating_belakang: detail.id_mesin_coating_belakang,
    jumlah_harga_coating_depan: detail.jumlah_harga_coating_depan,
    jumlah_harga_coating_belakang: detail.jumlah_harga_coating_belakang,
    total_harga_coating: detail.total_harga_coating,

    // PostPress
    id_jenis_pons: detail.id_jenis_pons?.toString(),
    id_mesin_pons: detail.id_mesin_pons?.toString(),
    harga_pisau: detail.harga_pisau?.toString(),
    ongkos_pons: detail.ongkos_pons,
    ongkos_pons_qty: detail.ongkos_pons_qty?.toString(),
    harga_satuan_ongkos_pons: detail.harga_satuan_ongkos_pons?.toString(),
    total_harga_ongkos_pons: detail.total_harga_ongkos_pons?.toString(),

    // Lipat
    lipat: detail.lipat,
    id_mesin_lipat: detail.id_mesin_lipat?.toString(),
    qty_lipat: detail.qty_lipat?.toString(),
    harga_lipat: detail.harga_lipat?.toString() || '0',

    // Potong
    potong_jadi: detail.potong_jadi,
    id_mesin_potong: detail.id_mesin_potong?.toString(),
    qty_potong: detail.qty_potong?.toString(),
    harga_potong_jadi: detail.harga_potong_jadi?.toString() || '0',

    // PostPress2 - Finishing & Lem
    id_lem: detail.id_lem?.toString() || '',
    jumlah_harga_lem: detail.jumlah_harga_lem?.toString() || '0',
    id_mesin_finishing: detail.id_mesin_finishing?.toString() || '',

    // PostPress2 - Foil
    foil: detail.foil || null,
    spot_foil: detail.spot_foil || null,
    harga_foil_manual: detail.harga_foil_manual?.toString() || '0',
    harga_spot_foil_manual: detail.harga_spot_foil_manual?.toString() || '0',
    harga_polimer_manual: detail.harga_polimer_manual?.toString() || '0',

    // PostPress2 - Packing
    jenis_packing: detail.jenis_packing || '',
    id_packing: detail.id_packing?.toString() || '',
    qty_packing: detail.qty_packing?.toString() || '0',
    harga_packing: detail.harga_packing?.toString() || '0',
    harga_pengiriman_awal: detail.harga_area_pengiriman?.toString() || '0',

    // PostPress2 - Packaging
    panjang_packaging: detail.panjang_packaging?.toString() || '',
    lebar_packaging: detail.lebar_packaging?.toString() || '',
    no_packaging: detail.no_packaging || '0.00',
    jumlah_kirim: detail.jumlah_kirim?.toString() || '0',
    harga_packaging: detail.harga_packaging?.toString() || '0',
    harga_pengiriman: detail.harga_pengiriman?.toString() || '0',

    // Profit
    harga_produksi: detail.harga_produksi.toString(),
    profit: detail.profit.toString(),
    profit_harga: detail.profit_harga.toString(),
    jumlah_harga_jual: detail.jumlah_harga_jual.toString(),
    ppn: detail.ppn.toString(),
    harga_ppn: detail.harga_ppn.toString(),
    diskon: detail.diskon.toString(),
    harga_diskon: detail.harga_diskon.toString(),
    total_harga: detail.total_harga.toString(),
    harga_satuan: detail.harga_satuan.toString(),
    total_harga_satuan_customer: detail.total_harga_satuan_customer.toString(),
    keterangan_harga: detail.keterangan_harga || '',
    keterangan_kerja: detail.keterangan_kerja || '',

    // Lain-lain
    lain_lain:
      detail.lain_lain?.map((item) => ({
        nama_item: item.nama_item,
        harga: item.harga,
      })) || [],
    total_harga_lain_lain:
      detail.lain_lain?.reduce((sum, item) => sum + item.harga, 0).toString() ||
      '0',

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

  // Initialize form with edit data if in edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      const convertedData = convertDetailToFormData(editData);
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

  // Handle quantity list changes with automatic recalculation
  const handleQtyListChange = (newList: QtyListItem[]) => {
    setFormData((prev) => {
      const updated = { ...prev, qty_list: newList };

      // Update selected quantity
      const selectedQty = newList.find((item) => item.is_selected);
      if (selectedQty) {
        updated.qty_kalkulasi = selectedQty.qty.toString();

        // Recalculate financial data with new quantity
        const financialData = calculateFinancialData(updated);
        updated.profit_harga = financialData.profit_harga.toString();
        updated.jumlah_harga_jual = financialData.jumlah_harga_jual.toString();
        updated.harga_ppn = financialData.harga_ppn.toString();
        updated.harga_diskon = financialData.harga_diskon.toString();
        updated.total_harga = financialData.total_harga.toString();
        updated.harga_satuan = financialData.harga_satuan.toString();
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
          updated.total_harga_lain_lain = lainLainTotal.toString();
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
      updated.harga_produksi = newHargaProduksi.toString();

      // Always recalculate financial data
      const financialData = calculateFinancialData(updated);
      updated.profit_harga = financialData.profit_harga.toString();
      updated.jumlah_harga_jual = financialData.jumlah_harga_jual.toString();
      updated.harga_ppn = financialData.harga_ppn.toString();
      updated.harga_diskon = financialData.harga_diskon.toString();
      updated.total_harga = financialData.total_harga.toString();
      updated.harga_satuan = financialData.harga_satuan.toString();

      return updated;
    });

    setHasUnsavedChanges(true);
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
                {isEditMode ? 'Edit Kalkulasi' : 'Tambah Kalkulasi Baru'}{' '}
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
