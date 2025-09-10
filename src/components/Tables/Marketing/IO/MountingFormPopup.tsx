// components/MountingFormPopup.tsx
import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { MountingData, MountingFormData, TahapanData } from './Mounting';
import GeneralTab from './Tabs/GeneralTab';
import WarnaTab from './Tabs/WarnaTab';
import CoatingTab from './Tabs/CoatingTab';
import PondTab from './Tabs/PondTab';
import TahapanTab from './Tabs/TahapanTab';
interface MountingFormPopupProps {
  ioId: number;
  mountingData?: MountingData | null;
  existingMountings?: MountingData[];
  tahapan?: TahapanData[];
  isOpen: boolean;
  onClose: () => void;
}

const MountingFormPopup: React.FC<MountingFormPopupProps> = ({
  ioId,
  mountingData,
  existingMountings = [],
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('general');
  const [formData, setFormData] = useState<MountingFormData>({
    // Initialize with default values...
    nama_mounting: '',
    barcode: '',
    format_data: 'CTP',

    ukuran_jadi_panjang: 0,
    ukuran_jadi_lebar: 0,
    ukuran_jadi_tinggi: 0,
    ukuran_jadi_terb_panjang: 0,
    ukuran_jadi_terb_lebar: 0,
    jenis_kertas: '',
    gramature_kertas: 0,
    lebar_plano: 0,
    panjang_plano: 0,
    jumlah_warna: 0,
    warna_depan: 0,
    warna_belakang: 0,
    keterangan_revisi: '',
    id_coating_depan: 0,
    id_coating_belakang: 0,
    id_kertas: 0,
    id_jenis_pons: 0,
    id_lem: 0,
    merk_coating_depan: '',
    merk_coating_belakang: '',
    keterangan_warna_depan: '',
    keterangan_warna_belakang: '',
    keterangan_jenis_pons: '',
    keterangan_lem: '',
    merk_komp_lem: '',
    merk_serat_kertas: '',
    lebar_layout: 0,
    panjang_layout: 0,
    ukuran_cetak_panjang_1: 0,
    ukuran_cetak_lebar_1: 0,
    ukuran_cetak_bagian_1: 0,
    ukuran_cetak_isi_1: 0,
    ukuran_cetak_panjang_2: 0,
    ukuran_cetak_lebar_2: 0,
    ukuran_cetak_bagian_2: 0,
    ukuran_cetak_isi_2: 0,
    isi_salam_1_pack: 0,
    jenis_pack: '',
    keterangan_pack: '',
    is_ukuran_partisi_sekat: false,
    lebar_partisi_1: 0,
    panjang_partisi_1: 0,
    lebar_partisi_2: 0,
    panjang_partisi_2: 0,
    tambahan_insheet_druk: '',
    lampiran: '',
    tahapan: [],
  });

  const tabs = [
    { id: 'general', label: 'General', component: GeneralTab },
    { id: 'warna', label: 'Warna', component: WarnaTab },
    { id: 'coating', label: 'Coating & Kertas', component: CoatingTab },
    { id: 'pond', label: 'Pond, Finishing & Packing', component: PondTab },
    { id: 'tahapan', label: 'Tahapan', component: TahapanTab },
    { id: 'lampiran', label: 'Lampiran' },
    { id: 'partisi', label: 'Partisi' },
    { id: 'tambahan', label: 'Tambahan Insheet' },
  ];
  // Generate next mounting name
  const generateNextMountingName = (): string => {
    if (existingMountings.length === 0) return 'A';

    const sortedNames = existingMountings
      .map((m) => m.nama_mounting)
      .filter((name) => name && name.length === 1)
      .sort();

    if (sortedNames.length === 0) return 'A';

    const lastChar = sortedNames[sortedNames.length - 1];
    const nextCharCode = lastChar.charCodeAt(0) + 1;

    return String.fromCharCode(nextCharCode);
  };

  // Get template mounting (mounting A) for copying default values
  const getTemplateMounting = (): MountingData | null => {
    return existingMountings.find((m) => m.nama_mounting === 'A') || null;
  };

  useEffect(() => {
    if (mountingData) {
      // Edit mode - populate with existing data
      setFormData({
        nama_mounting: mountingData.nama_mounting || '',
        barcode: mountingData.barcode || '',
        format_data: mountingData.format_data || 'CTP',
        ukuran_jadi_panjang: mountingData.ukuran_jadi_panjang || 0,
        ukuran_jadi_lebar: mountingData.ukuran_jadi_lebar || 0,
        ukuran_jadi_tinggi: mountingData.ukuran_jadi_tinggi || 0,
        ukuran_jadi_terb_panjang: mountingData.ukuran_jadi_terb_panjang || 0,
        ukuran_jadi_terb_lebar: mountingData.ukuran_jadi_terb_lebar || 0,
        jenis_kertas: mountingData.jenis_kertas || '',
        gramature_kertas: mountingData.gramature_kertas || 0,
        lebar_plano: mountingData.lebar_plano || 0,
        panjang_plano: mountingData.panjang_plano || 0,
        jumlah_warna: mountingData.jumlah_warna || 0,
        warna_depan: mountingData.warna_depan || 0,
        warna_belakang: mountingData.warna_belakang || 0,
        keterangan_revisi: mountingData.keterangan_revisi || '',
        id_coating_depan: mountingData.id_coating_depan || 0,
        id_coating_belakang: mountingData.id_coating_belakang || 0,
        id_kertas: mountingData.id_kertas || 0,
        id_jenis_pons: mountingData.id_jenis_pons || 0,
        id_lem: mountingData.id_lem || 0,
        merk_coating_depan: mountingData.merk_coating_depan || '',
        merk_coating_belakang: mountingData.merk_coating_belakang || '',
        keterangan_warna_depan: mountingData.keterangan_warna_depan || '',
        keterangan_warna_belakang: mountingData.keterangan_warna_belakang || '',
        keterangan_jenis_pons: mountingData.keterangan_jenis_pons || '',
        keterangan_lem: mountingData.keterangan_lem || '',
        merk_komp_lem: mountingData.merk_komp_lem || '',
        merk_serat_kertas: mountingData.merk_serat_kertas || '',
        lebar_layout: mountingData.lebar_layout || 0,
        panjang_layout: mountingData.panjang_layout || 0,
        ukuran_cetak_panjang_1: mountingData.ukuran_cetak_panjang_1 || 0,
        ukuran_cetak_lebar_1: mountingData.ukuran_cetak_lebar_1 || 0,
        ukuran_cetak_bagian_1: mountingData.ukuran_cetak_bagian_1 || 0,
        ukuran_cetak_isi_1: mountingData.ukuran_cetak_isi_1 || 0,
        ukuran_cetak_panjang_2: mountingData.ukuran_cetak_panjang_2 || 0,
        ukuran_cetak_lebar_2: mountingData.ukuran_cetak_lebar_2 || 0,
        ukuran_cetak_bagian_2: mountingData.ukuran_cetak_bagian_2 || 0,
        ukuran_cetak_isi_2: mountingData.ukuran_cetak_isi_2 || 0,
        isi_salam_1_pack: mountingData.isi_salam_1_pack || 0,
        jenis_pack: mountingData.jenis_pack || '',
        keterangan_pack: mountingData.keterangan_pack || '',
        is_ukuran_partisi_sekat: mountingData.is_ukuran_partisi_sekat || false,
        lebar_partisi_1: mountingData.lebar_partisi_1 || 0,
        panjang_partisi_1: mountingData.panjang_partisi_1 || 0,
        lebar_partisi_2: mountingData.lebar_partisi_2 || 0,
        panjang_partisi_2: mountingData.panjang_partisi_2 || 0,
        tambahan_insheet_druk: mountingData.tambahan_insheet_druk || '',
        lampiran: mountingData.lampiran || '',
        tahapan: mountingData.tahapan || [],
      });
    } else {
      // Create mode - use template mounting A if exists
      const templateMounting = getTemplateMounting();
      const nextName = generateNextMountingName();

      setFormData({
        nama_mounting: nextName,
        barcode: templateMounting?.barcode || '',
        format_data: templateMounting?.format_data || 'CTP',
        ukuran_jadi_panjang: templateMounting?.ukuran_jadi_panjang || 0,
        ukuran_jadi_lebar: templateMounting?.ukuran_jadi_lebar || 0,
        ukuran_jadi_tinggi: templateMounting?.ukuran_jadi_tinggi || 0,
        ukuran_jadi_terb_panjang:
          templateMounting?.ukuran_jadi_terb_panjang || 0,
        ukuran_jadi_terb_lebar: templateMounting?.ukuran_jadi_terb_lebar || 0,
        jenis_kertas: templateMounting?.jenis_kertas || '',
        gramature_kertas: templateMounting?.gramature_kertas || 0,
        lebar_plano: templateMounting?.lebar_plano || 0,
        panjang_plano: templateMounting?.panjang_plano || 0,
        jumlah_warna: templateMounting?.jumlah_warna || 0,
        warna_depan: templateMounting?.warna_depan || 0,
        warna_belakang: templateMounting?.warna_belakang || 0,
        keterangan_revisi: '',
        id_coating_depan: templateMounting?.id_coating_depan || 0,
        id_coating_belakang: templateMounting?.id_coating_belakang || 0,
        id_kertas: templateMounting?.id_kertas || 0,
        id_jenis_pons: templateMounting?.id_jenis_pons || 0,
        id_lem: templateMounting?.id_lem || 0,
        merk_coating_depan: templateMounting?.merk_coating_depan || '',
        merk_coating_belakang: templateMounting?.merk_coating_belakang || '',
        keterangan_warna_depan: templateMounting?.keterangan_warna_depan || '',
        keterangan_warna_belakang:
          templateMounting?.keterangan_warna_belakang || '',
        keterangan_jenis_pons: templateMounting?.keterangan_jenis_pons || '',
        keterangan_lem: templateMounting?.keterangan_lem || '',
        merk_komp_lem: templateMounting?.merk_komp_lem || '',
        merk_serat_kertas: templateMounting?.merk_serat_kertas || '',
        lebar_layout: templateMounting?.lebar_layout || 0,
        panjang_layout: templateMounting?.panjang_layout || 0,
        ukuran_cetak_panjang_1: templateMounting?.ukuran_cetak_panjang_1 || 0,
        ukuran_cetak_lebar_1: templateMounting?.ukuran_cetak_lebar_1 || 0,
        ukuran_cetak_bagian_1: templateMounting?.ukuran_cetak_bagian_1 || 0,
        ukuran_cetak_isi_1: templateMounting?.ukuran_cetak_isi_1 || 0,
        ukuran_cetak_panjang_2: templateMounting?.ukuran_cetak_panjang_2 || 0,
        ukuran_cetak_lebar_2: templateMounting?.ukuran_cetak_lebar_2 || 0,
        ukuran_cetak_bagian_2: templateMounting?.ukuran_cetak_bagian_2 || 0,
        ukuran_cetak_isi_2: templateMounting?.ukuran_cetak_isi_2 || 0,
        isi_salam_1_pack: templateMounting?.isi_salam_1_pack || 0,
        jenis_pack: templateMounting?.jenis_pack || '',
        keterangan_pack: templateMounting?.keterangan_pack || '',
        is_ukuran_partisi_sekat:
          templateMounting?.is_ukuran_partisi_sekat || false,
        lebar_partisi_1: templateMounting?.lebar_partisi_1 || 0,
        panjang_partisi_1: templateMounting?.panjang_partisi_1 || 0,
        lebar_partisi_2: templateMounting?.lebar_partisi_2 || 0,
        panjang_partisi_2: templateMounting?.panjang_partisi_2 || 0,
        tambahan_insheet_druk: templateMounting?.tambahan_insheet_druk || '',
        lampiran: templateMounting?.lampiran || '',
        tahapan: templateMounting?.tahapan || [], // Add this line
      });
    }
  }, [mountingData, existingMountings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEdit = mountingData && mountingData.id;
    const url = isEdit
      ? `${import.meta.env.VITE_API_LINK}/marketing/io/mounting/${
          mountingData.id
        }`
      : `${import.meta.env.VITE_API_LINK}/marketing/io/mounting/${ioId}`;

    try {
      setLoading(true);
      const res: AxiosResponse = isEdit
        ? await axios.put(
            url,
            { data_mounting: formData },
            { withCredentials: true },
          )
        : await axios.post(
            url,
            { data_mounting: formData },
            { withCredentials: true },
          );

      if (res.data.succes) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving mounting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof MountingFormData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderTabContent = () => {
    const currentTab = tabs.find((tab) => tab.id === activeTab);
    if (!currentTab || !currentTab.component) return null;

    const TabComponent = currentTab.component;
    if (
      activeTab === 'general' ||
      activeTab === 'warna' ||
      activeTab === 'coating' ||
      activeTab === 'pond' ||
      activeTab === 'tahapan' // Add this line
    ) {
      return (
        <TabComponent
          formData={formData}
          onInputChange={() => handleInputChange}
          isEditMode={!!mountingData}
        />
      );
    }
    return null;
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {mountingData ? 'Edit Mounting' : 'Create Mounting'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
            {renderTabContent()}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MountingFormPopup;
