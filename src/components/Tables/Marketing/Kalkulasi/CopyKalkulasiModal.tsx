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

  useEffect(() => {
    // Initialize form data from original data
    // In CopyKalkulasiModal.tsx, update the initializeFormData function:

    const initializeFormData = () => {
      const initialData: KalkulasiFormData = {
        tgl_kalkulasi: new Date().toISOString().split('T')[0],
        status_kalkulasi: copyType === 'repeat' ? 'repeat' : 'repeat perubahan',
        id_customer: originalData.id_customer || 0,
        id_marketing: originalData.id_marketing || 0,
        id_produk: originalData.id_produk || 0,
        id_area_pengiriman: originalData.id_area_pengiriman || 0,
        qty_kalkulasi: originalData.qty_kalkulasi?.toString() || '0',
        presentase_insheet: originalData.presentase_insheet?.toString() || '',
        spesifikasi: originalData.spesifikasi || '',
        ukuran_jadi_panjang:
          originalData.ukuran_jadi_panjang?.toString() || '0',
        ukuran_jadi_lebar: originalData.ukuran_jadi_lebar?.toString() || '0',
        ukuran_jadi_tinggi: originalData.ukuran_jadi_tinggi?.toString() || '0',
        ukuran_jadi_terb_panjang:
          originalData.ukuran_jadi_terb_panjang?.toString() || '0',
        ukuran_jadi_terb_lebar:
          originalData.ukuran_jadi_terb_lebar?.toString() || '0',
        ukuran_cetak_panjang_1:
          originalData.ukuran_cetak_panjang_1?.toString() || '0',
        ukuran_cetak_lebar_1:
          originalData.ukuran_cetak_lebar_1?.toString() || '0',
        ukuran_cetak_bagian_1:
          originalData.ukuran_cetak_bagian_1?.toString() || '0',
        ukuran_cetak_isi_1: originalData.ukuran_cetak_isi_1?.toString() || '0',
        ukuran_cetak_bbs_1: originalData.ukuran_cetak_bbs_1 || 'no',
        ukuran_cetak_panjang_2:
          originalData.ukuran_cetak_panjang_2?.toString() || '0',
        ukuran_cetak_lebar_2:
          originalData.ukuran_cetak_lebar_2?.toString() || '0',
        ukuran_cetak_bagian_2:
          originalData.ukuran_cetak_bagian_2?.toString() || '0',
        ukuran_cetak_isi_2: originalData.ukuran_cetak_isi_2?.toString() || '0',
        ukuran_cetak_bbs_2: originalData.ukuran_cetak_bbs_2 || 'no',
        harga_produksi: originalData.harga_produksi?.toString() || '0',
        profit_harga: originalData.profit_harga?.toString() || '0',
        jumlah_harga_jual: originalData.jumlah_harga_jual?.toString() || '0',
        harga_ppn: originalData.harga_ppn?.toString() || '0',
        ppn: originalData.ppn?.toString() || '0',
        diskon: originalData.diskon?.toString() || '0',
        harga_diskon: originalData.harga_diskon?.toString() || '0',
        total_harga: originalData.total_harga?.toString() || '0',
        harga_satuan: originalData.harga_satuan?.toString() || '0',
        total_harga_satuan_customer:
          originalData.total_harga_satuan_customer?.toString() || '0',
        keterangan_harga: originalData.keterangan_harga || '',
        keterangan_kerja: originalData.keterangan_kerja || '',
        warna_depan: originalData.warna_depan?.toString() || '0',
        warna_belakang: originalData.warna_belakang?.toString() || '0',
        jumlah_warna: originalData.jumlah_warna?.toString() || '0',
        nama_customer: originalData.nama_customer || '',
        nama_marketing: originalData.nama_marketing || '',
        nama_area_pengiriman: originalData.nama_area_pengiriman || '',
        nama_produk: originalData.nama_produk || '',
        profit: originalData.profit?.toString() || '',
        lain_lain: originalData.lain_lain || [],
        total_harga_lain_lain:
          originalData.lain_lain
            ?.reduce((sum, item) => sum + (item.harga || 0), 0)
            ?.toString() || '0',

        // PREPRESS FIELDS:
        jenis_kertas: originalData.jenis_kertas || '',
        id_kertas: originalData.id_kertas?.toString() || '',
        id_mesin_potong: originalData.id_mesin_potong?.toString() || '',
        gramature: originalData.gramature_kertas?.toString() || '',
        panjangMm: originalData.panjang_kertas?.toString() || '',
        lebarMm: originalData.lebar_kertas?.toString() || '',
        percentage: originalData.persentase_apki_kertas?.toString() || '',
        rawPercentage: originalData.persentase_kertas?.toString() || '',
        total_kertas: originalData.total_kertas?.toString() || '',
        total_harga_kertas: originalData.total_harga_kertas?.toString() || '',

        // PRESS FIELDS:
        id_jenis_mesin_cetak:
          originalData.id_jenis_mesin_cetak?.toString() || '',
        id_coating_depan: originalData.id_coating_depan?.toString() || '',
        id_coating_belakang: originalData.id_coating_belakang?.toString() || '',
        id_mesin_coating_depan:
          originalData.id_mesin_coating_depan?.toString() || '',
        id_mesin_coating_belakang:
          originalData.id_mesin_coating_belakang?.toString() || '',
        harga_plate: originalData.harga_plate?.toString() || '',

        // POST-PRESS FIELDS:
        pons_insheet: originalData.pons_insheet?.toString() || '',
        id_jenis_pons: originalData.id_jenis_pons?.toString() || '',
        id_mesin_pons: originalData.id_mesin_pons?.toString() || '',
        harga_pisau: originalData.harga_pisau?.toString() || '',
        ongkos_pons: originalData.ongkos_pons || 'No',
        ongkos_pons_qty: originalData.ongkos_pons_qty?.toString() || '1',
        harga_satuan_ongkos_pons:
          originalData.harga_satuan_ongkos_pons?.toString() || '0.00',
        total_harga_ongkos_pons:
          originalData.total_harga_ongkos_pons?.toString() || '0.00',
        lipat: originalData.lipat || 'No',
        id_mesin_lipat: originalData.id_mesin_lipat?.toString() || '',
        qty_lipat: originalData.qty_lipat?.toString() || '1',
        harga_lipat: originalData.harga_lipat?.toString() || '0.00',
        potong_jadi: originalData.potong_jadi || 'No',
        qty_potong: originalData.qty_potong?.toString() || '1',
        harga_potong_jadi: originalData.harga_potong_jadi?.toString() || '0.00',

        // OTHER MISSING FIELDS (add any other fields that might be missing):
        print_insheet: originalData.print_insheet?.toString() || '0',
        finishing_insheet: originalData.finishing_insheet?.toString() || '0',
        // POST-PRESS 2 FIELDS:

        id_lem: originalData.id_lem?.toString() || '',
        jumlah_harga_lem: originalData.jumlah_harga_lem?.toString() || '0.00',
        id_mesin_finishing: originalData.id_mesin_finishing?.toString() || '',
        foil: originalData.foil || '-',
        spot_foil: originalData.spot_foil || '-',
        harga_foil_manual: originalData.harga_foil_manual?.toString() || '0',
        harga_spot_foil_manual:
          originalData.harga_spot_foil_manual?.toString() || '0',
        harga_polimer_manual:
          originalData.harga_polimer_manual?.toString() || '0',
        jenis_packing: originalData.jenis_packing || '-',
        id_packing: originalData.id_packing?.toString() || '',
        qty_packing: originalData.qty_packing?.toString() || '1',
        harga_packing: originalData.harga_packing?.toString() || '0',
        panjang_packaging: originalData.panjang_packaging?.toString() || '',
        lebar_packaging: originalData.lebar_packaging?.toString() || '',
        no_packaging: originalData.no_packaging?.toString() || '0.00',
        jumlah_kirim: originalData.jumlah_kirim?.toString() || '1',
        harga_packaging: originalData.harga_packaging?.toString() || '0',
        harga_pengiriman: originalData.harga_pengiriman?.toString() || '0',
        // Add id_kalkulasi_previous
        id_kalkulasi_previous: originalData.id,
      };

      console.log('Initialized formData with all fields:', {
        prepress: {
          jenis_kertas: initialData.jenis_kertas,
          id_kertas: initialData.id_kertas,
          id_mesin_potong: initialData.id_mesin_potong,
        },
        postpress: {
          pons_insheet: initialData.pons_insheet,
          id_jenis_pons: initialData.id_jenis_pons,
          id_mesin_pons: initialData.id_mesin_pons,
          ongkos_pons: initialData.ongkos_pons,
          lipat: initialData.lipat,
          id_mesin_lipat: initialData.id_mesin_lipat,
          potong_jadi: initialData.potong_jadi,
        },
      });

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

        // Convert PostPress fields to proper types
        pons_insheet: formData.pons_insheet || '',
        id_jenis_pons: formData.id_jenis_pons
          ? Number(formData.id_jenis_pons)
          : null,
        id_mesin_pons: formData.id_mesin_pons
          ? Number(formData.id_mesin_pons)
          : null,
        harga_pisau: formData.harga_pisau ? Number(formData.harga_pisau) : 0,
        ongkos_pons: formData.ongkos_pons || 'No',
        ongkos_pons_qty: formData.ongkos_pons_qty
          ? Number(formData.ongkos_pons_qty)
          : 1,
        harga_satuan_ongkos_pons: formData.harga_satuan_ongkos_pons
          ? Number(formData.harga_satuan_ongkos_pons.replace(/[^\d.-]/g, ''))
          : 0,
        total_harga_ongkos_pons: formData.total_harga_ongkos_pons
          ? Number(formData.total_harga_ongkos_pons.replace(/[^\d.-]/g, ''))
          : 0,
        lipat: formData.lipat || 'No',
        id_mesin_lipat: formData.id_mesin_lipat
          ? Number(formData.id_mesin_lipat)
          : null,
        qty_lipat: formData.qty_lipat ? Number(formData.qty_lipat) : 1,
        harga_lipat: formData.harga_lipat
          ? Number(formData.harga_lipat.replace(/[^\d.-]/g, ''))
          : 0,
        potong_jadi: formData.potong_jadi || 'No',
        qty_potong: formData.qty_potong ? Number(formData.qty_potong) : 1,
        harga_potong_jadi: formData.harga_potong_jadi
          ? Number(formData.harga_potong_jadi.replace(/[^\d.-]/g, ''))
          : 0,

        // PostPress2 fields
        finishing_insheet: formData.finishing_insheet || '',
        id_lem: formData.id_lem ? Number(formData.id_lem) : null,
        jumlah_harga_lem: formData.jumlah_harga_lem
          ? Number(formData.jumlah_harga_lem.replace(/[^\d.-]/g, ''))
          : 0,
        id_mesin_finishing: formData.id_mesin_finishing
          ? Number(formData.id_mesin_finishing)
          : null,
        foil: formData.foil || '-',
        spot_foil: formData.spot_foil || '-',
        harga_foil_manual: formData.harga_foil_manual
          ? Number(formData.harga_foil_manual.replace(/[^\d.-]/g, ''))
          : 0,
        harga_spot_foil_manual: formData.harga_spot_foil_manual
          ? Number(formData.harga_spot_foil_manual.replace(/[^\d.-]/g, ''))
          : 0,
        harga_polimer_manual: formData.harga_polimer_manual
          ? Number(formData.harga_polimer_manual.replace(/[^\d.-]/g, ''))
          : 0,
        jenis_packing: formData.jenis_packing || '-',
        id_packing: formData.id_packing ? Number(formData.id_packing) : null,
        qty_packing: formData.qty_packing ? Number(formData.qty_packing) : 1,
        harga_packing: formData.harga_packing
          ? Number(formData.harga_packing)
          : 0,
        panjang_packaging: formData.panjang_packaging
          ? Number(formData.panjang_packaging)
          : null,
        lebar_packaging: formData.lebar_packaging
          ? Number(formData.lebar_packaging)
          : null,
        no_packaging: formData.no_packaging ? Number(formData.no_packaging) : 0,
        jumlah_kirim: formData.jumlah_kirim ? Number(formData.jumlah_kirim) : 1,
        harga_packaging: formData.harga_packaging
          ? Number(formData.harga_packaging)
          : 0,
        harga_pengiriman: formData.harga_pengiriman
          ? Number(formData.harga_pengiriman)
          : 0,
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
    if (isReadOnly) return;

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
    formData.total_harga_lain_lain,
    formData.lain_lain,
    isReadOnly,
  ]);

  useEffect(() => {
    if (isReadOnly) return;

    const financialData = calculateFinancialData(formData);

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
        profit_harga: financialData.profit_harga.toString(),
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
                  copyType={copyType}
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
                    value={formData.keterangan_kerja}
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
