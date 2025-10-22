// JOPPICCreateModal.tsx
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  JOFormData,
  JOTipeOption,
  MountingData,
  SOData,
} from '../types/jo.types';
import {
  BasicInfoSection,
  MountingSection,
  ProductionDetailsSection,
} from './JOPPICFormSections';

interface JOPPICCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tipeJO: JOTipeOption;
}

const JOPPICCreateModal: React.FC<JOPPICCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tipeJO,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingMounting, setLoadingMounting] = useState(false);
  const [soData, setSOData] = useState<SOData[]>([]);
  const [mountingData, setMountingData] = useState<MountingData[]>([]);
  const [selectedMounting, setSelectedMounting] = useState<number[]>([]);
  const [jumlahJO, setJumlahJO] = useState<number>(0);

  const [formData, setFormData] = useState<Partial<JOFormData>>({
    id_io: 0,
    id_so: 0,
    id_customer: 0,
    id_produk: 0,
    no_jo: '',
    no_io: '',
    no_so: '',
    customer: '',
    produk: '',
    status_kalkulasi: 'BARU',
    status_jo: 'BARU',
    stok_fg: 0,
    qty: 0,
    po_qty: 0,
    spesifikasi: '',
    keterangan_pengerjaan: '',
    toleransi: '',
    alamat_pengiriman: '',
    tgl_kirim: new Date().toISOString().split('T')[0],
    standar_warna: '',
    tipe_jo: tipeJO,
    jo_mounting: [],
  });

  useEffect(() => {
    if (isOpen) {
      fetchSOData();
      fetchJumlahJO();
    }
  }, [isOpen]);

  useEffect(() => {
    if (jumlahJO > 0) {
      generateJONumber();
    }
  }, [jumlahJO]);

  const fetchSOData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/so`;
    try {
      setLoading(true);
      const res: AxiosResponse = await axios.get(url, {
        params: { is_jo_done: false },
        withCredentials: true,
      });
      console.log('SO data fetched:', res.data);
      setSOData(res.data.data || []);
    } catch (error) {
      console.error('Error fetching SO data:', error);
      setSOData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJumlahJO = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/joJumlahData`;
    try {
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      setJumlahJO(res.data.total_data || 0);
      console.log('Jumlah JO fetched:', res.data);
    } catch (error) {
      console.error('Error fetching jumlah JO:', error);
      setJumlahJO(0);
    }
  };

  const generateJONumber = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const nextNumber = String(jumlahJO + 1).padStart(5, '0');
    const joNumber = `JO-${nextNumber}/${month}/${year}`;

    setFormData((prev) => ({
      ...prev,
      no_jo: joNumber,
    }));
  };

  const fetchMountingData = async (idIO: number): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/io/${idIO}`;
    try {
      setLoadingMounting(true);
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      console.log('Mounting data response:', res.data);
      if (res.data.data && res.data.data.io_mounting) {
        const mountings = res.data.data.io_mounting || [];
        setMountingData(mountings);

        // Auto-select all mountings
        const allMountingIds = mountings.map((m: MountingData) => m.id);
        setSelectedMounting(allMountingIds);
      }
    } catch (error) {
      console.error('Error fetching mounting data:', error);
      setMountingData([]);
      setSelectedMounting([]);
    } finally {
      setLoadingMounting(false);
    }
  };
  const fetchCustomerData = async (idCus: number): Promise<void> => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/marketing/customer/${idCus}`;
    try {
      setLoadingMounting(true);
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      console.log('Customer data response:', res.data);
      if (res.data.data) {
        const customer = res.data.data || {};
        setFormData((prev) => ({
          ...prev,
          id_customer: customer.id || 0,
          customer: customer.name || '',
          toleransi: customer.toleransi_pengiriman || '',
          alamat_pengiriman: customer.alamat_pengiriman || '',
          standar_warna: customer.ada_standar_warna || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoadingMounting(false);
    }
  };

  const handleSOChange = (soId: number) => {
    const selectedSO = soData.find((so) => so.id === soId);
    if (selectedSO) {
      setFormData((prev) => ({
        ...prev,
        id_so: selectedSO.id,
        id_io: selectedSO.id_io,
        id_customer: selectedSO.id_customer, // You might need to get this from SO
        id_produk: 0, // You might need to get this from SO
        no_so: selectedSO.no_so,
        no_io: selectedSO.no_io,
        customer: selectedSO.customer,
        produk: selectedSO.produk,
        po_qty: selectedSO.po_qty,
        alamat_pengiriman: selectedSO.alamat_pengiriman || '',
        standar_warna: selectedSO.ada_standar_warna || '',
      }));

      // Fetch mounting data automatically
      fetchMountingData(selectedSO.id_io);
      fetchCustomerData(selectedSO.id_customer);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMountingSelect = (mountingId: number) => {
    setSelectedMounting((prev) => {
      if (prev.includes(mountingId)) {
        return prev.filter((id) => id !== mountingId);
      } else {
        return [...prev, mountingId];
      }
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.id_so) {
      alert('Pilih SO terlebih dahulu');
      return;
    }

    if (selectedMounting.length === 0) {
      alert('Pilih minimal satu mounting');
      return;
    }

    // Prepare jo_mounting data
    const joMountingData = mountingData
      .filter((m) => selectedMounting.includes(m.id))
      .map((mounting) => ({
        id_io_mounting: mounting.id,
        id_kertas: mounting.id_kertas,
        nama_kertas: mounting.jenis_kertas,
        gramature_kertas: mounting.gramature_kertas,
        panjang_kertas: mounting.panjang_plano,
        lebar_kertas: mounting.lebar_plano,
        jumlah_kertas: 0,
        ukuran_cetak_panjang_1: mounting.ukuran_cetak_panjang_1,
        ukuran_cetak_lebar_1: mounting.ukuran_cetak_lebar_1,
        ukuran_cetak_bagian_1: mounting.ukuran_cetak_bagian_1,
        ukuran_cetak_isi_1: mounting.ukuran_cetak_isi_1,
        jumlah_cetak_1: 0,
        tambahan_insheet_1: 0,
        ukuran_cetak_panjang_2: mounting.ukuran_cetak_panjang_2 || 0,
        ukuran_cetak_lebar_2: mounting.ukuran_cetak_lebar_2 || 0,
        ukuran_cetak_bagian_2: mounting.ukuran_cetak_bagian_2 || 0,
        ukuran_cetak_isi_2: mounting.ukuran_cetak_isi_2 || 0,
        jumlah_cetak_2: 0,
        tambahan_insheet_2: 0,
        jumlah_druk_cetak: 0,
        jumlah_insheet_cetak: 0,
        jumlah_druk_pond: 0,
        jumlah_insheet_pond: 0,
        jumlah_druk_finishing: 0,
        jumlah_insheet_finishing: 0,
        total_insheet: 0,
        is_selected: true,
      }));

    const submitData = {
      ...formData,
      jo_mounting: joMountingData,
    };

    try {
      setLoading(true);
      const url = `${import.meta.env.VITE_API_LINK}/ppic/jo`;
      const res: AxiosResponse = await axios.post(url, submitData, {
        withCredentials: true,
      });

      if (res.data.success) {
        alert('JO berhasil dibuat');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error creating JO:', error);
      alert('Gagal membuat JO');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />
        {/* Modal panel */}
        <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700">
            <h2 className="text-xl font-bold text-white">Tambah {tipeJO}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
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

          {/* Body */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Basic Info Section */}
              <BasicInfoSection
                formData={formData}
                soData={soData}
                onSOChange={handleSOChange}
                loadingMounting={loadingMounting}
              />

              {/* Production Details Section */}
              <ProductionDetailsSection
                formData={formData}
                onChange={handleFieldChange}
              />

              {/* Mounting Section */}
              <MountingSection
                mountingData={mountingData}
                selectedMounting={selectedMounting}
                onMountingSelect={handleMountingSelect}
                loadingMounting={loadingMounting}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || selectedMounting.length === 0}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {loading ? 'Menyimpan...' : 'Simpan JO'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default JOPPICCreateModal;
