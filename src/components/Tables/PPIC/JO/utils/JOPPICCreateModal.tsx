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
  InsheetCalculationSection,
  MountingSection,
  ProductionDetailsSection,
} from './JOPPICFormSections';

interface JOPPICCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tipeJO: JOTipeOption;
  editMode?: boolean;
  editJOId?: number | null;
}

const JOPPICCreateModal: React.FC<JOPPICCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tipeJO,
  editMode = false,
  editJOId = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingMounting, setLoadingMounting] = useState(false);
  const [soData, setSOData] = useState<SOData[]>([]);
  const [mountingData, setMountingData] = useState<MountingData[]>([]);
  const [selectedMounting, setSelectedMounting] = useState<number[]>([]);
  const [jumlahJO, setJumlahJO] = useState<number>(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialFormData: Partial<JOFormData> = {
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
  };
  const [formData, setFormData] =
    useState<Partial<JOFormData>>(initialFormData);

  const [ketentuanInsheetData, setKetentuanInsheetData] = useState<any[]>([]);
  const [prosesInsheetData, setProsesInsheetData] = useState<any[]>([]);
  const [insheetValues, setInsheetValues] = useState<{
    [mountingId: number]: {
      jumlah_druk_cetak: number;
      jumlah_insheet_cetak: number;
      jumlah_druk_pond: number;
      jumlah_insheet_pond: number;
      jumlah_druk_finishing: number;
      jumlah_insheet_finishing: number;
      total_insheet: number;
    };
  }>({});
  useEffect(() => {
    if (formData.id_so || selectedMounting.length > 0) {
      setHasUnsavedChanges(true);
    }
  }, [formData.id_so, selectedMounting]);
  useEffect(() => {
    if (!isOpen) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isOpen, hasUnsavedChanges]);
  // In JOPPICCreateModal.tsx - Update calculateInsheetValues
  const calculateInsheetValues = (
    mounting: MountingData,
    poQty: number,
    ketentuanInsheet: number,
  ) => {
    const ukuranCetakIsi1 = mounting.ukuran_cetak_isi_1 || 1;
    const ukuranCetakBagian1 = mounting.ukuran_cetak_bagian_1 || 1;
    const jumlahDruk = Math.ceil(
      (poQty / ukuranCetakIsi1 + ketentuanInsheet) / ukuranCetakBagian1,
    );

    console.log('Calculating insheet for mounting:', mounting.nama_mounting);
    console.log('Jumlah Druk:', jumlahDruk);
    console.log('Proses Insheet Data:', prosesInsheetData);

    const insheetByProcess: { [key: string]: number } = {};
    prosesInsheetData.forEach((proses) => {
      const insheet = Math.ceil((jumlahDruk * proses.persentase_insheet) / 100);
      // Try both uppercase variations
      const prosesKey = proses.proses.toUpperCase();
      insheetByProcess[prosesKey] = insheet;
      console.log(`${prosesKey}: ${insheet}`);
    });

    // Try different possible names for POND/PONDS
    const jumlahInsheetCetak = insheetByProcess['CETAK'] || 0;
    const jumlahInsheetPond =
      insheetByProcess['POND'] ||
      insheetByProcess['PONDS'] ||
      insheetByProcess['PONDING'] ||
      0;
    const jumlahInsheetFinishing = insheetByProcess['FINISHING'] || 0;

    console.log('Cetak:', jumlahInsheetCetak);
    console.log('Pond:', jumlahInsheetPond);
    console.log('Finishing:', jumlahInsheetFinishing);

    const totalInsheet =
      jumlahInsheetCetak + jumlahInsheetPond + jumlahInsheetFinishing;

    return {
      jumlah_druk_cetak: jumlahDruk,
      jumlah_insheet_cetak: jumlahInsheetCetak,
      jumlah_druk_pond: jumlahDruk,
      jumlah_insheet_pond: jumlahInsheetPond,
      jumlah_druk_finishing: jumlahDruk,
      jumlah_insheet_finishing: jumlahInsheetFinishing,
      total_insheet: totalInsheet,
    };
  };

  useEffect(() => {
    if (isOpen) {
      fetchSOData();
      fetchJumlahJO();
      fetchKetentuanInsheet();
      fetchProsesInsheet();
    }
  }, [isOpen]);

  useEffect(() => {
    if (jumlahJO > 0) {
      generateJONumber();
    } else
      setFormData((prev) => ({
        ...prev,
        no_jo:
          'JO-00001/' +
          new Date().toISOString().slice(5, 7) +
          '/' +
          new Date().getFullYear(),
      }));
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

  // In JOPPICCreateModal.tsx - Update fetchMountingData
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

        // Initialize insheet values for all mountings
        const poQty = formData.po_qty || 0;
        const ketentuanInsheet = getKetentuanInsheet(poQty);

        const newInsheetValues: typeof insheetValues = {};
        mountings.forEach((mounting: MountingData) => {
          const insheetCalc = calculateInsheetValues(
            mounting,
            poQty,
            ketentuanInsheet,
          );
          newInsheetValues[mounting.id] = insheetCalc;
        });

        setInsheetValues(newInsheetValues);
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

          toleransi: customer.toleransi_pengiriman || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoadingMounting(false);
    }
  };
  const fetchKetentuanInsheet = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/master/ketentuanInsheet`;
    try {
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      console.log('Ketentuan Insheet data:', res.data);
      setKetentuanInsheetData(res.data.data || []);
    } catch (error) {
      console.error('Error fetching ketentuan insheet:', error);
      setKetentuanInsheetData([]);
    }
  };

  const fetchProsesInsheet = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/master/prosesInsheet`;
    try {
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      console.log('Proses Insheet data:', res.data);
      setProsesInsheetData(res.data.data || []);
    } catch (error) {
      console.error('Error fetching proses insheet:', error);
      setProsesInsheetData([]);
    }
  };
  const fetchJODetail = async (joId: number): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jo/${joId}`;
    try {
      setLoading(true);
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      console.log('Fetched JO detail:', res.data);

      if (res.data.data) {
        const joDetail = res.data.data;

        // Set form data
        setFormData({
          id_io: joDetail.id_io,
          id_jo: joDetail.id,
          id_so: joDetail.id_so,
          id_customer: joDetail.id_customer,
          id_produk: joDetail.id_produk,
          no_jo: joDetail.no_jo,
          no_io: joDetail.no_io,
          no_so: joDetail.no_so,
          customer: joDetail.customer,
          produk: joDetail.produk,
          status_kalkulasi: joDetail.status_kalkulasi,
          status_jo: joDetail.status_jo,
          stok_fg: joDetail.stok_fg || 0,
          qty: joDetail.qty || 0,
          po_qty: joDetail.po_qty || 0,
          spesifikasi: joDetail.spesifikasi || '',
          keterangan_pengerjaan: joDetail.keterangan_pengerjaan || '',
          toleransi: joDetail.toleransi || '',
          alamat_pengiriman: joDetail.alamat_pengiriman || '',
          tgl_kirim: joDetail.tgl_kirim
            ? joDetail.tgl_kirim.split('T')[0]
            : new Date().toISOString().split('T')[0],
          standar_warna: joDetail.standar_warna || '',
          tipe_jo: joDetail.tipe_jo,
          jo_mounting: joDetail.jo_mounting || [],
        });

        // Fetch mounting data first
        if (joDetail.id_io) {
          await fetchMountingData(joDetail.id_io);

          // After mounting data is loaded, set selected mounting and insheet values
          if (joDetail.jo_mounting && joDetail.jo_mounting.length > 0) {
            const mountingIds = joDetail.jo_mounting.map(
              (jm: any) => jm.id_io_mounting,
            );
            setSelectedMounting(mountingIds);

            // Set insheet values from jo_mounting
            const newInsheetValues: typeof insheetValues = {};
            joDetail.jo_mounting.forEach((jm: any) => {
              newInsheetValues[jm.id_io_mounting] = {
                jumlah_druk_cetak: jm.jumlah_druk_cetak || 0,
                jumlah_insheet_cetak: jm.jumlah_insheet_cetak || 0,
                jumlah_druk_pond: jm.jumlah_druk_pond || 0,
                jumlah_insheet_pond: jm.jumlah_insheet_pond || 0,
                jumlah_druk_finishing: jm.jumlah_druk_finishing || 0,
                jumlah_insheet_finishing: jm.jumlah_insheet_finishing || 0,
                total_insheet: jm.total_insheet || 0,
              };
            });
            setInsheetValues(newInsheetValues);
          }
        }

        // Fetch customer data
        if (joDetail.id_customer) {
          await fetchCustomerData(joDetail.id_customer);
        }
      }
    } catch (error) {
      console.error('Error fetching JO detail:', error);
      alert('Gagal mengambil data JO');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ...initialFormData,
      tipe_jo: tipeJO,
    });
    setSelectedMounting([]);
    setMountingData([]);
    setInsheetValues({});
    setHasUnsavedChanges(false);
  };
  useEffect(() => {
    if (isOpen && editMode && editJOId) {
      fetchJODetail(editJOId);
    } else if (isOpen && !editMode) {
      // Reset form when opening in create mode
      resetForm();
    }
  }, [isOpen, editMode, editJOId]);
  // Add function to get ketentuan based on po_qty
  const getKetentuanInsheet = (poQty: number): number => {
    const ketentuan = ketentuanInsheetData.find((k) => {
      const batasBawah = parseInt(k.batas_bawah);
      const batasAtas =
        k.batas_atas === '-' ? Infinity : parseInt(k.batas_atas);
      return poQty >= batasBawah && poQty <= batasAtas;
    });

    if (!ketentuan) return 0;

    if (ketentuan.is_persentase) {
      return (poQty * ketentuan.nilai) / 100;
    }
    return ketentuan.nilai;
  };

  // Add function to generate spesifikasi from mounting
  const generateSpesifikasi = (mountings: MountingData[]): string => {
    if (mountings.length === 0) return '';

    const specs = mountings.map((mounting) => {
      const warnaDepan = mounting.warna_depan || 0;
      const warnaBelakang = mounting.warna_belakang || 0;
      const coatingDepan = mounting.nama_coating_depan ? 1 : 0;
      const coatingBelakang = mounting.nama_coating_belakang ? 1 : 0;

      const coatingNames = [
        mounting.nama_coating_depan,
        mounting.nama_coating_belakang,
      ]
        .filter(Boolean)
        .join(' + ');

      return `${warnaDepan}/${warnaBelakang} + ${coatingDepan}/${coatingBelakang} ${coatingNames}`.trim();
    });

    return specs.join('; ');
  };
  const handleSOChange = (soId: number) => {
    const selectedSO = soData.find((so) => so.id === soId);
    if (selectedSO) {
      setFormData((prev) => ({
        ...prev,
        id_so: selectedSO.id,
        id_io: selectedSO.id_io,
        id_customer: selectedSO.id_customer,
        id_produk: 0,
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
      const newSelected = prev.includes(mountingId)
        ? prev.filter((id) => id !== mountingId)
        : [...prev, mountingId];

      // Regenerate spesifikasi
      const selectedMountings = mountingData.filter((m) =>
        newSelected.includes(m.id),
      );
      const spesifikasi = generateSpesifikasi(selectedMountings);

      setFormData((prevData) => ({
        ...prevData,
        spesifikasi,
      }));

      // Initialize insheet values for newly selected mounting
      if (!prev.includes(mountingId) && mountingId) {
        const mounting = mountingData.find((m) => m.id === mountingId);
        if (mounting) {
          const poQty = formData.po_qty || 0;
          const ketentuanInsheet = getKetentuanInsheet(poQty);
          const insheetCalc = calculateInsheetValues(
            mounting,
            poQty,
            ketentuanInsheet,
          );

          setInsheetValues((prevValues) => ({
            ...prevValues,
            [mountingId]: insheetCalc,
          }));
        }
      } else if (prev.includes(mountingId)) {
        // Remove insheet values for deselected mounting
        setInsheetValues((prevValues) => {
          const newValues = { ...prevValues };
          delete newValues[mountingId];
          return newValues;
        });
      }

      return newSelected;
    });
  };
  // Update the handleInsheetChange function to sync all druk values
  const handleInsheetChange = (
    mountingId: number,
    field: string,
    value: number,
  ) => {
    setInsheetValues((prev) => {
      const currentValues = prev[mountingId] || {};
      const updatedValues = {
        ...currentValues,
        [field]: value,
      };

      // If jumlah_druk_cetak changes, sync it to pond and finishing
      if (field === 'jumlah_druk_cetak') {
        updatedValues.jumlah_druk_pond = value;
        updatedValues.jumlah_druk_finishing = value;
      }

      // Recalculate total_insheet if individual insheet values change
      if (
        field === 'jumlah_insheet_cetak' ||
        field === 'jumlah_insheet_pond' ||
        field === 'jumlah_insheet_finishing'
      ) {
        updatedValues.total_insheet =
          (updatedValues.jumlah_insheet_cetak || 0) +
          (updatedValues.jumlah_insheet_pond || 0) +
          (updatedValues.jumlah_insheet_finishing || 0);
      }

      return {
        ...prev,
        [mountingId]: updatedValues,
      };
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

    // Prepare jo_mounting data with insheet values from state
    const joMountingData = mountingData
      .filter((m) => selectedMounting.includes(m.id))
      .map((mounting) => {
        const insheetData = insheetValues[mounting.id] || {};
        const ukuranCetakBagian1 = mounting.ukuran_cetak_bagian_1 || 1;

        // Use the common jumlah_druk value (they should all be the same)
        const jumlahDruk = insheetData.jumlah_druk_cetak || 0;
        const jumlahLP = Math.ceil(jumlahDruk / ukuranCetakBagian1);

        return {
          id: mounting.id, // Include id for updates
          id_jo: formData.id_jo,
          id_io_mounting: mounting.id,
          id_kertas: mounting.id_kertas,
          nama_kertas: mounting.jenis_kertas,
          gramature_kertas: mounting.gramature_kertas,
          panjang_kertas: mounting.panjang_plano,
          lebar_kertas: mounting.lebar_plano,
          jumlah_kertas: jumlahLP, // Store jumlah LP in jumlah_kertas
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
          jumlah_druk_cetak: jumlahDruk, // All druk values are the same
          jumlah_insheet_cetak: insheetData.jumlah_insheet_cetak || 0,
          jumlah_druk_pond: jumlahDruk, // Same as cetak
          jumlah_insheet_pond: insheetData.jumlah_insheet_pond || 0,
          jumlah_druk_finishing: jumlahDruk, // Same as cetak
          jumlah_insheet_finishing: insheetData.jumlah_insheet_finishing || 0,
          total_insheet: insheetData.total_insheet || 0,
          is_selected: true,
        };
      });

    const submitData = {
      ...formData,
      jo_mounting: joMountingData,
    };

    try {
      setLoading(true);
      console.log('Submitting JO data:', submitData);
      if (editMode && editJOId) {
        // UPDATE existing JO
        const url = `${import.meta.env.VITE_API_LINK}/ppic/jo/${editJOId}`;
        const res: AxiosResponse = await axios.put(url, submitData, {
          withCredentials: true,
        });
        console.log('JO update response:', res.data);
        if (res.data.success || res.data.succes) {
          alert('JO berhasil diupdate');
          setHasUnsavedChanges(false);
          onSuccess();
          onClose();
        }
      } else {
        // CREATE new JO
        const url = `${import.meta.env.VITE_API_LINK}/ppic/jo`;
        const res: AxiosResponse = await axios.post(url, submitData, {
          withCredentials: true,
        });
        console.log('JO creation response:', res.data);
        if (res.data.success || res.data.succes) {
          alert('JO berhasil dibuat');
          setHasUnsavedChanges(false);
          onSuccess();
          onClose();
        }
      }
    } catch (error: any) {
      console.error('Error saving JO:', error);
      const errorMessage =
        error.response?.data?.message || 'Gagal menyimpan JO';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm(
        'Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin menutup form ini?',
      );
      if (confirmClose) {
        resetForm(); // Clear form on close
        onClose();
      }
    } else {
      resetForm(); // Clear form on close
      onClose();
    }
  };
  // In JOPPICCreateModal.tsx - Update the modal container
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="flex items-center justify-center w-full h-full px-4 py-4">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />
        {/* Modal panel - FULL SCREEN */}
        <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 flex-shrink-0">
            <h2 className="text-xl font-bold text-white">
              {editMode ? `Edit ${tipeJO}` : `Tambah ${tipeJO}`}
            </h2>
            <button
              onClick={handleClose}
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
                editMode={editMode}
              />

              {/* Production Details Section */}
              <ProductionDetailsSection
                formData={formData}
                onChange={handleFieldChange}
              />

              <MountingSection
                mountingData={mountingData}
                selectedMounting={selectedMounting}
                onMountingSelect={handleMountingSelect}
                loadingMounting={loadingMounting}
                insheetValues={insheetValues}
              />

              <InsheetCalculationSection
                mountingData={mountingData.filter((m) =>
                  selectedMounting.includes(m.id),
                )}
                poQty={formData.po_qty || 0}
                ketentuanInsheetData={ketentuanInsheetData}
                prosesInsheetData={prosesInsheetData}
                insheetValues={insheetValues}
                onInsheetChange={handleInsheetChange}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <button
              onClick={handleClose}
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
              {loading ? 'Menyimpan...' : editMode ? 'Update JO' : 'Simpan JO'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default JOPPICCreateModal;
