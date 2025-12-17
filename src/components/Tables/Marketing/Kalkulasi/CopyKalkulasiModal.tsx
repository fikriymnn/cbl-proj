// CopyKalkulasiModal.tsx
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
import {
  KalkulasiFormData,
  KalkulasiDetailItem,
  ApiResponse,
} from '../Kalkulasi/types/kalkulasi';

interface CopyKalkulasiModalProps {
  originalData: KalkulasiDetailItem;
  copyType: 'repeat' | 'repeat_perubahan';
  onClose: () => void;
  onSuccess: () => void;
}

const CopyKalkulasiModal: React.FC<CopyKalkulasiModalProps> = ({
  originalData,
  copyType,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<string>('ukuran-jadi');
  const [formData, setFormData] = useState<KalkulasiFormData>(
    {} as KalkulasiFormData,
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const isReadOnly = copyType === 'repeat';

  // Helper function to safely convert to string
  const safeToString = (value: any, defaultValue: string = '0'): string => {
    if (value === null || value === undefined || value === '')
      return defaultValue;
    return String(value);
  };

  // Helper function to safely get number value
  const safeNumber = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '')
      return defaultValue;
    const num = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  };

  useEffect(() => {
    // Initialize form data from original data
    const initializeFormData = () => {
      const initialData: KalkulasiFormData = {
        kode_kalkulasi: originalData.kode_kalkulasi || '',
        tgl_kalkulasi: (originalData.tgl_kalkulasi || '').split('T')[0],
        status_kalkulasi: originalData.status_kalkulasi || 'draft',
        id_customer: originalData.id_customer || 0,
        id_marketing: originalData.id_marketing || 0,
        id_produk: originalData.id_produk || 0,
        id_area_pengiriman: originalData.id_area_pengiriman || 0,
        qty_kalkulasi: safeToString(originalData.qty_kalkulasi, '1'),
        presentase_insheet: safeToString(originalData.presentase_insheet),
        spesifikasi: originalData.spesifikasi || '',
        ukuran_jadi_panjang: safeToString(originalData.ukuran_jadi_panjang),
        ukuran_jadi_lebar: safeToString(originalData.ukuran_jadi_lebar),
        ukuran_jadi_tinggi: safeToString(originalData.ukuran_jadi_tinggi),
        ukuran_jadi_terb_panjang: safeToString(
          originalData.ukuran_jadi_terb_panjang,
        ),
        ukuran_jadi_terb_lebar: safeToString(
          originalData.ukuran_jadi_terb_lebar,
        ),
        ukuran_cetak_panjang_1: safeToString(
          originalData.ukuran_cetak_panjang_1,
        ),
        ukuran_cetak_lebar_1: safeToString(originalData.ukuran_cetak_lebar_1),
        ukuran_cetak_bagian_1: safeToString(originalData.ukuran_cetak_bagian_1),
        ukuran_cetak_isi_1: safeToString(originalData.ukuran_cetak_isi_1),
        ukuran_cetak_bbs_1: originalData.ukuran_cetak_bbs_1 || 'no',
        ukuran_cetak_panjang_2: safeToString(
          originalData.ukuran_cetak_panjang_2,
        ),
        ukuran_cetak_lebar_2: safeToString(originalData.ukuran_cetak_lebar_2),
        ukuran_cetak_bagian_2: safeToString(originalData.ukuran_cetak_bagian_2),
        ukuran_cetak_isi_2: safeToString(originalData.ukuran_cetak_isi_2),
        ukuran_cetak_bbs_2: originalData.ukuran_cetak_bbs_2 || 'no',
        warna_depan: safeToString(originalData.warna_depan),
        warna_belakang: safeToString(originalData.warna_belakang),
        jumlah_warna: safeToString(originalData.jumlah_warna),
        nama_customer: originalData.nama_customer || '',
        nama_marketing: originalData.nama_marketing || '',
        nama_area_pengiriman: originalData.nama_area_pengiriman || '',
        nama_produk: originalData.nama_produk || '',
        print_insheet: safeToString(originalData.print_insheet, ''),
        pons_insheet: safeToString(originalData.pons_insheet, ''),
        finishing_insheet: safeToString(originalData.finishing_insheet, ''),
        // Kertas
        id_kertas: originalData.id_kertas || 0,
        jenis_kertas: originalData.jenis_kertas || '',
        gramature: safeNumber(originalData.gramature_kertas),
        panjangMm: safeNumber(originalData.panjang_kertas),
        lebarMm: safeNumber(originalData.lebar_kertas),
        percentage: safeNumber(originalData.persentase_kertas),
        apki: safeNumber(originalData.persentase_apki_kertas),
        total_kertas: safeNumber(originalData.total_kertas),
        total_harga_kertas: safeNumber(originalData.total_harga_kertas),
        // Cetak
        id_jenis_mesin_cetak: originalData.id_jenis_mesin_cetak || 0,
        jumlah_harga_cetak: safeNumber(originalData.jumlah_harga_cetak),
        harga_plate: safeToString(originalData.harga_plate),
        // Coating
        id_coating_depan: originalData.id_coating_depan || 0,
        id_coating_belakang: originalData.id_coating_belakang || 0,
        id_mesin_coating_depan: originalData.id_mesin_coating_depan || 0,
        id_mesin_coating_belakang: originalData.id_mesin_coating_belakang || 0,
        jumlah_harga_coating_depan: safeNumber(
          originalData.jumlah_harga_coating_depan,
        ),
        jumlah_harga_coating_belakang: safeNumber(
          originalData.jumlah_harga_coating_belakang,
        ),
        total_harga_coating: safeNumber(originalData.total_harga_coating),
        // PostPress
        id_jenis_pons: safeToString(originalData.id_jenis_pons, ''),
        id_mesin_pons: safeToString(originalData.id_mesin_pons, ''),
        harga_pisau: safeToString(originalData.harga_pisau),
        ongkos_pons: originalData.ongkos_pons || 'No',
        ongkos_pons_qty: safeToString(originalData.ongkos_pons_qty, '1'),
        harga_satuan_ongkos_pons: safeToString(
          originalData.harga_satuan_ongkos_pons,
        ),
        total_harga_ongkos_pons: safeToString(
          originalData.total_harga_ongkos_pons,
        ),
        // Lipat
        lipat: originalData.lipat || 'No',
        id_mesin_lipat: safeToString(originalData.id_mesin_lipat, ''),
        qty_lipat: safeToString(originalData.qty_lipat, '1'),
        harga_lipat: safeToString(originalData.harga_lipat),
        // Potong
        potong_jadi: originalData.potong_jadi || 'No',
        id_mesin_potong: safeToString(originalData.id_mesin_potong, ''),
        qty_potong: safeToString(originalData.qty_potong, '1'),
        harga_potong_jadi: safeToString(originalData.harga_potong_jadi),
        // PostPress2
        id_lem: safeToString(originalData.id_lem, ''),
        jumlah_harga_lem: safeToString(originalData.jumlah_harga_lem),
        id_mesin_finishing: safeToString(originalData.id_mesin_finishing, ''),
        foil: originalData.foil || '-',
        spot_foil: originalData.spot_foil || '-',
        harga_foil_manual: safeToString(originalData.harga_foil_manual),
        harga_spot_foil_manual: safeToString(
          originalData.harga_spot_foil_manual,
        ),
        harga_polimer_manual: safeToString(originalData.harga_polimer_manual),
        // Packaging
        panjang_packaging: safeToString(originalData.panjang_packaging),
        lebar_packaging: safeToString(originalData.lebar_packaging),
        no_packaging: safeToString(originalData.no_packaging),
        jumlah_kirim: safeToString(originalData.jumlah_kirim, '1'),
        harga_packaging: safeToString(originalData.harga_packaging),
        harga_pengiriman: safeToString(originalData.harga_pengiriman),
        jenis_packing: originalData.jenis_packing || '-',
        id_packing: safeToString(originalData.id_packing, ''),
        qty_packing: safeToString(originalData.qty_packing, '1'),
        harga_packing: safeToString(originalData.harga_packing),
        // Profit
        harga_produksi: safeToString(originalData.harga_produksi),
        profit: safeToString(originalData.profit),
        profit_harga: safeToString(originalData.profit_harga),
        jumlah_harga_jual: safeToString(originalData.jumlah_harga_jual),
        ppn: safeToString(originalData.ppn),
        harga_ppn: safeToString(originalData.harga_ppn),
        diskon: safeToString(originalData.diskon),
        harga_diskon: safeToString(originalData.harga_diskon),
        total_harga: safeToString(originalData.total_harga),
        harga_satuan: safeToString(originalData.harga_satuan),
        total_harga_satuan_customer: safeToString(
          originalData.total_harga_satuan_customer,
        ),
        keterangan_harga: originalData.keterangan_harga || '',
        keterangan_kerja: originalData.keterangan_kerja || '',
        // Lain-lain
        lain_lain: Array.isArray(originalData.lain_lain)
          ? originalData.lain_lain.map((item) => ({
              nama_item: item.nama_item || '',
              harga: safeNumber(item.harga),
            }))
          : [],
        total_harga_lain_lain: safeToString(
          Array.isArray(originalData.lain_lain)
            ? originalData.lain_lain.reduce(
                (sum, item) => sum + safeNumber(item.harga),
                0,
              )
            : 0,
        ),
        // Type
        tipe_kalkulasi:
          (originalData.tipe_kalkulasi as 'normal' | 'multi' | 'manual') ||
          'normal',
        label: originalData.label || '',
        qty_list:
          Array.isArray(originalData.qty_list) &&
          originalData.qty_list.length > 0
            ? originalData.qty_list
            : [
                {
                  qty: safeNumber(originalData.qty_kalkulasi, 1),
                  is_selected: true,
                },
              ],
      };

      setFormData(initialData);
    };

    initializeFormData();
  }, [originalData, copyType]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent): string | void => {
      if (hasUnsavedChanges && !isReadOnly) {
        e.preventDefault();
        e.returnValue =
          'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isReadOnly]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    if (isReadOnly) return; // Prevent changes if read-only

    const { name, value } = e.target;

    setFormData((prev) => {
      let updated = { ...prev };

      // Special handling for lain_lain array
      if (name === 'lain_lain') {
        try {
          updated.lain_lain = JSON.parse(value);
        } catch (error) {
          console.error('Error parsing lain_lain:', error);
          updated.lain_lain = [];
        }
      } else {
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

        updated.harga_produksi = financialData.harga_produksi.toString();
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

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    const url = `${import.meta.env.VITE_API_LINK}/marketing/kalkulasi`;

    try {
      setIsSubmitting(true);

      const submitData = {
        ...formData,
        qty_kalkulasi: safeNumber(formData.qty_kalkulasi, 1),
        harga_produksi: safeNumber(formData.harga_produksi),
        profit: safeNumber(formData.profit),
        profit_harga: safeNumber(formData.profit_harga),
        total_harga: safeNumber(formData.total_harga),
        harga_satuan: safeNumber(formData.harga_satuan),
        total_harga_satuan_customer: safeNumber(
          formData.total_harga_satuan_customer,
        ),
        harga_ppn: safeNumber(formData.harga_ppn),
        diskon: safeNumber(formData.diskon),
        harga_diskon: safeNumber(formData.harga_diskon),
        presentase_insheet: safeNumber(formData.presentase_insheet),
        ukuran_jadi_panjang: safeNumber(formData.ukuran_jadi_panjang),
        ukuran_jadi_lebar: safeNumber(formData.ukuran_jadi_lebar),
        ukuran_jadi_tinggi: safeNumber(formData.ukuran_jadi_tinggi),
        ukuran_jadi_terb_panjang: safeNumber(formData.ukuran_jadi_terb_panjang),
        ukuran_jadi_terb_lebar: safeNumber(formData.ukuran_jadi_terb_lebar),
        ukuran_cetak_panjang_1: safeNumber(formData.ukuran_cetak_panjang_1),
        ukuran_cetak_lebar_1: safeNumber(formData.ukuran_cetak_lebar_1),
        ukuran_cetak_bagian_1: safeNumber(formData.ukuran_cetak_bagian_1),
        ukuran_cetak_isi_1: safeNumber(formData.ukuran_cetak_isi_1),
        ukuran_cetak_panjang_2: safeNumber(formData.ukuran_cetak_panjang_2),
        ukuran_cetak_lebar_2: safeNumber(formData.ukuran_cetak_lebar_2),
        ukuran_cetak_bagian_2: safeNumber(formData.ukuran_cetak_bagian_2),
        ukuran_cetak_isi_2: safeNumber(formData.ukuran_cetak_isi_2),
        lain_lain: Array.isArray(formData.lain_lain) ? formData.lain_lain : [],
        total_harga_lain_lain: safeNumber(formData.total_harga_lain_lain),

        // Convert PostPress fields to proper types
        pons_insheet: formData.pons_insheet || '',
        id_jenis_pons: formData.id_jenis_pons
          ? safeNumber(formData.id_jenis_pons)
          : null,
        id_mesin_pons: formData.id_mesin_pons
          ? safeNumber(formData.id_mesin_pons)
          : null,
        harga_pisau: safeNumber(formData.harga_pisau),
        ongkos_pons: formData.ongkos_pons || 'No',
        ongkos_pons_qty: safeNumber(formData.ongkos_pons_qty, 1),
        harga_satuan_ongkos_pons: safeNumber(formData.harga_satuan_ongkos_pons),
        total_harga_ongkos_pons: safeNumber(formData.total_harga_ongkos_pons),

        lipat: formData.lipat || 'No',
        id_mesin_lipat: formData.id_mesin_lipat
          ? safeNumber(formData.id_mesin_lipat)
          : null,
        qty_lipat: safeNumber(formData.qty_lipat, 1),
        harga_lipat: safeNumber(formData.harga_lipat),
        potong_jadi: formData.potong_jadi || 'No',
        id_mesin_potong: formData.id_mesin_potong
          ? safeNumber(formData.id_mesin_potong)
          : null,
        qty_potong: safeNumber(formData.qty_potong, 1),
        harga_potong_jadi: safeNumber(formData.harga_potong_jadi),

        // PostPress2 fields
        finishing_insheet: formData.finishing_insheet || '',
        id_lem: formData.id_lem ? safeNumber(formData.id_lem) : null,
        jumlah_harga_lem: safeNumber(formData.jumlah_harga_lem),
        id_mesin_finishing: formData.id_mesin_finishing
          ? safeNumber(formData.id_mesin_finishing)
          : null,
        foil: formData.foil || '-',
        spot_foil: formData.spot_foil || '-',
        harga_foil_manual: safeNumber(formData.harga_foil_manual),
        harga_spot_foil_manual: safeNumber(formData.harga_spot_foil_manual),
        harga_polimer_manual: safeNumber(formData.harga_polimer_manual),
        jenis_packing: formData.jenis_packing || '-',
        id_packing: formData.id_packing
          ? safeNumber(formData.id_packing)
          : null,
        qty_packing: safeNumber(formData.qty_packing, 1),
        harga_packing: safeNumber(formData.harga_packing),
        panjang_packaging: formData.panjang_packaging
          ? safeNumber(formData.panjang_packaging)
          : null,
        lebar_packaging: formData.lebar_packaging
          ? safeNumber(formData.lebar_packaging)
          : null,
        no_packaging: safeNumber(formData.no_packaging),
        jumlah_kirim: safeNumber(formData.jumlah_kirim, 1),
        harga_packaging: safeNumber(formData.harga_packaging),
        harga_pengiriman: safeNumber(formData.harga_pengiriman),
        id_kalkulasi_previous: originalData.id,
        status_kalkulasi: copyType === 'repeat' ? 'repeat' : 'repeat perubahan',
      };

      const res: AxiosResponse<ApiResponse> = await axios.post(
        url,
        submitData,
        {
          withCredentials: true,
        },
      );

      if (
        res.data &&
        (res.data.succes || res.status === 200 || res.status === 201)
      ) {
        setHasUnsavedChanges(false);
        alert(
          `Kalkulasi ${
            copyType === 'repeat' ? 'repeat' : 'repeat perubahan'
          } berhasil disimpan!`,
        );
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
      if (!isReadOnly && hasUnsavedChanges) {
        const confirmCancel = window.confirm(
          'Data akan hilang. Apakah Anda yakin ingin membatalkan?',
        );
        if (!confirmCancel) return;
      }
      setHasUnsavedChanges(false);
      onClose();
    }
  };

  // Calculate effects for repeat perubahan only
  useEffect(() => {
    if (isReadOnly || !formData.harga_produksi) return;

    const newHargaProduksi = calculateHargaProduksi(formData);
    const currentHargaProduksi = safeNumber(
      String(formData.harga_produksi).replace(/[Rp.\s,]/g, ''),
    );

    if (Math.abs(currentHargaProduksi - newHargaProduksi) > 0.01) {
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
    formData.total_harga_lain_lain,
    formData.lain_lain,
    isReadOnly,
  ]);

  useEffect(() => {
    if (isReadOnly || !formData.harga_produksi) return;

    const financialData = calculateFinancialData(formData);

    const needsUpdate =
      Math.abs(safeNumber(formData.profit_harga) - financialData.profit_harga) >
        0.01 ||
      Math.abs(
        safeNumber(formData.jumlah_harga_jual) -
          financialData.jumlah_harga_jual,
      ) > 0.01 ||
      Math.abs(safeNumber(formData.harga_ppn) - financialData.harga_ppn) >
        0.01 ||
      Math.abs(safeNumber(formData.harga_diskon) - financialData.harga_diskon) >
        0.01 ||
      Math.abs(safeNumber(formData.total_harga) - financialData.total_harga) >
        0.01 ||
      Math.abs(safeNumber(formData.harga_satuan) - financialData.harga_satuan) >
        0.01;

    if (needsUpdate) {
      setFormData((prev) => ({
        ...prev,
        profit_harga: financialData.profit_harga.toString(),
        jumlah_harga_jual: financialData.jumlah_harga_jual.toString(),
        harga_ppn: financialData.harga_ppn.toString(),
        harga_diskon: financialData.harga_diskon.toString(),
        total_harga: financialData.total_harga.toString(),
        harga_satuan: financialData.harga_satuan.toString(),
      }));
    }
  }, [
    formData.harga_produksi,
    formData.profit,
    formData.ppn,
    formData.diskon,
    formData.qty_kalkulasi,
    isReadOnly,
  ]);

  const getHeaderTitle = () => {
    return copyType === 'repeat'
      ? 'Copy Kalkulasi - Repeat'
      : 'Copy Kalkulasi - Repeat Perubahan';
  };

  const getHeaderColor = () => {
    return copyType === 'repeat'
      ? 'from-blue-600 to-blue-700'
      : 'from-green-600 to-green-700';
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div
          className={`bg-gradient-to-r ${getHeaderColor()} text-white px-6 py-4 shadow-lg`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{getHeaderTitle()}</h1>
              {isReadOnly && (
                <p className="text-blue-100 text-sm mt-1">
                  Mode View Only - Data tidak dapat diubah
                </p>
              )}
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
                id="copy-kalkulasi-form"
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                <BasicInfoForm
                  formData={formData}
                  onInputChange={handleInputChange}
                  isReadOnly={isReadOnly}
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
                    isReadOnly={isReadOnly}
                    copyType={copyType}
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
                    value={formData.keterangan_kerja || ''}
                    onChange={handleInputChange}
                    rows={4}
                    readOnly={isReadOnly}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg transition-all ${
                      isReadOnly
                        ? 'bg-gray-100 cursor-not-allowed'
                        : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
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
            copyType={copyType}
            isReadOnly={isReadOnly}
            submitButtonText={
              copyType === 'repeat'
                ? 'Simpan Repeat'
                : 'Simpan Repeat Perubahan'
            }
          />
        </div>
      </div>
    </div>
  );
};
export default CopyKalkulasiModal;
