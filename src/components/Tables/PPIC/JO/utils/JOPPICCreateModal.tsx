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
  const [selectedMounting, setSelectedMounting] = useState<number | null>(null);
  const [jumlahJO, setJumlahJO] = useState<number>(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ADD THIS NEW STATE
  const [isManualInsheetEdit, setIsManualInsheetEdit] = useState(false);

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
    jumlah_druk: number;
    jumlah_insheet_cetak: number;
    jumlah_insheet_pond: number;
    jumlah_insheet_finishing: number;
    total_insheet: number;
    jumlah_lp: number;
  }>({
    jumlah_druk: 0,
    jumlah_insheet_cetak: 0,
    jumlah_insheet_pond: 0,
    jumlah_insheet_finishing: 0,
    total_insheet: 0,
    jumlah_lp: 0,
  });

  // Auto-calculate qty when stok_fg or po_qty changes
  useEffect(() => {
    const calculatedQty = Math.max(
      0,
      (formData.po_qty || 0) - (formData.stok_fg || 0),
    );
    if (calculatedQty !== formData.qty) {
      setFormData((prev) => ({
        ...prev,
        qty: calculatedQty,
      }));
    }
  }, [formData.po_qty, formData.stok_fg]);

  useEffect(() => {
    // Only auto-calculate if NOT manually editing insheet
    if (selectedMounting && formData.qty && !isManualInsheetEdit) {
      const mounting = mountingData.find((m) => m.id === selectedMounting);
      if (mounting) {
        calculateInsheetFromQty(formData.qty, mounting);
      }
    }
  }, [formData.qty, selectedMounting]);
  useEffect(() => {
    if (isManualInsheetEdit) {
      const timer = setTimeout(() => {
        setIsManualInsheetEdit(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isManualInsheetEdit]);
  useEffect(() => {
    if (formData.id_so || selectedMounting) {
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

  // Calculate insheet from Qty (forward calculation)
  const calculateInsheetFromQty = (qty: number, mounting: MountingData) => {
    const isi = mounting.ukuran_cetak_isi_1 || 1;
    const bagian = mounting.ukuran_cetak_bagian_1 || 1;

    // Step 1: Calculate RAW Jumlah Druk (base, without insheet)
    const rawJumlahDruk = Math.ceil(qty / isi);

    // Step 2: Get Ketentuan Insheet BASED ON RAW DRUK (not qty)
    const ketentuanInsheet = getKetentuanInsheet(rawJumlahDruk);
    const ketentuanValue =
      typeof ketentuanInsheet === 'object'
        ? ketentuanInsheet.is_persentase
          ? (rawJumlahDruk * ketentuanInsheet.nilai) / 100
          : ketentuanInsheet.nilai
        : ketentuanInsheet;

    // Step 3: Calculate Total Insheet
    const totalInsheet = Math.ceil(ketentuanValue);

    // Step 4: Distribute to processes
    const totalPercentage = prosesInsheetData.reduce(
      (sum, p) => sum + p.persentase_insheet,
      0,
    );

    let cetak = 0,
      pond = 0,
      finishing = 0;

    prosesInsheetData.forEach((proses) => {
      const value = Math.ceil(
        (totalInsheet * proses.persentase_insheet) / totalPercentage,
      );
      const prosesName = proses.proses.toUpperCase();

      if (prosesName === 'CETAK') cetak = value;
      else if (
        prosesName === 'POND' ||
        prosesName === 'PONDS' ||
        prosesName === 'PONDING'
      )
        pond = value;
      else if (prosesName === 'FINISHING') finishing = value;
    });

    // Step 5: Calculate Jumlah LP
    const jumlahLP = Math.ceil((rawJumlahDruk + totalInsheet) / bagian);

    setInsheetValues({
      jumlah_druk: rawJumlahDruk, // Store RAW druk
      jumlah_insheet_cetak: cetak,
      jumlah_insheet_pond: pond,
      jumlah_insheet_finishing: finishing,
      total_insheet: totalInsheet,
      jumlah_lp: jumlahLP,
    });
  };

  // Calculate qty from total insheet (reverse calculation)
  const calculateQtyFromInsheet = (
    totalInsheet: number,
    mounting: MountingData,
  ) => {
    const isi = mounting.ukuran_cetak_isi_1 || 1;

    // Find matching ketentuan based on raw druk
    let ketentuanMatch = null;
    for (const ketentuan of ketentuanInsheetData) {
      if (ketentuan.is_persentase) {
        // Estimate raw druk from total insheet
        const estimatedRawDruk = (totalInsheet * 100) / ketentuan.nilai;
        const batasBawah = parseInt(ketentuan.batas_bawah);
        const batasAtas =
          ketentuan.batas_atas === '-'
            ? Infinity
            : parseInt(ketentuan.batas_atas);

        if (estimatedRawDruk >= batasBawah && estimatedRawDruk <= batasAtas) {
          ketentuanMatch = ketentuan;
          break;
        }
      } else {
        if (totalInsheet === ketentuan.nilai) {
          ketentuanMatch = ketentuan;
          break;
        }
      }
    }

    if (!ketentuanMatch) {
      ketentuanMatch = ketentuanInsheetData[0];
    }

    let rawDruk: number;

    if (ketentuanMatch.is_persentase) {
      // Calculate raw druk from total insheet
      rawDruk = Math.ceil((totalInsheet * 100) / ketentuanMatch.nilai);
    } else {
      // For fixed value, estimate raw druk from batas
      const batasBawah = parseInt(ketentuanMatch.batas_bawah);
      const batasAtas =
        ketentuanMatch.batas_atas === '-'
          ? batasBawah * 2
          : parseInt(ketentuanMatch.batas_atas);
      rawDruk = Math.floor((batasBawah + batasAtas) / 2);
    }

    // NEW FORMULA: qty = (raw_druk + total_insheet) * isi
    const calculatedQty = (rawDruk + totalInsheet) * isi;

    return Math.max(0, calculatedQty);
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
    } else {
      setFormData((prev) => ({
        ...prev,
        no_jo:
          'JO-00001/' +
          new Date().toISOString().slice(5, 7) +
          '/' +
          new Date().getFullYear(),
      }));
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
      if (res.data.data && res.data.data.io_mounting) {
        const mountings = res.data.data.io_mounting || [];
        setMountingData(mountings);
        setSelectedMounting(null);
        setInsheetValues({
          jumlah_druk: 0,
          jumlah_insheet_cetak: 0,
          jumlah_insheet_pond: 0,
          jumlah_insheet_finishing: 0,
          total_insheet: 0,
          jumlah_lp: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching mounting data:', error);
      setMountingData([]);
      setSelectedMounting(null);
    } finally {
      setLoadingMounting(false);
    }
  };

  const fetchCustomerData = async (idCus: number): Promise<void> => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/marketing/customer/${idCus}`;
    try {
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
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
    }
  };

  const fetchKetentuanInsheet = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/master/ketentuanInsheet`;
    try {
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
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

      if (res.data.data) {
        const joDetail = res.data.data;

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

        if (joDetail.id_io) {
          await fetchMountingData(joDetail.id_io);

          if (joDetail.jo_mounting && joDetail.jo_mounting.length > 0) {
            // Find the selected mounting (where is_selected is true)
            const selectedJoMounting = joDetail.jo_mounting.find(
              (jm: any) => jm.is_selected,
            );

            if (selectedJoMounting) {
              setSelectedMounting(selectedJoMounting.id_io_mounting);

              // The stored jumlah_druk values are the base values (without insheet already added)
              // So we use them directly
              setInsheetValues({
                jumlah_druk: selectedJoMounting.jumlah_druk_cetak || 0,
                jumlah_insheet_cetak:
                  selectedJoMounting.jumlah_insheet_cetak || 0,
                jumlah_insheet_pond:
                  selectedJoMounting.jumlah_insheet_pond || 0,
                jumlah_insheet_finishing:
                  selectedJoMounting.jumlah_insheet_finishing || 0,
                total_insheet: selectedJoMounting.total_insheet || 0,
                jumlah_lp: selectedJoMounting.jumlah_kertas || 0,
              });
            }
          }
        }

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
    setSelectedMounting(null);
    setMountingData([]);
    setInsheetValues({
      jumlah_druk: 0,
      jumlah_insheet_cetak: 0,
      jumlah_insheet_pond: 0,
      jumlah_insheet_finishing: 0,
      total_insheet: 0,
      jumlah_lp: 0,
    });
    setHasUnsavedChanges(false);
  };

  useEffect(() => {
    if (isOpen && editMode && editJOId) {
      fetchJODetail(editJOId);
    } else if (isOpen && !editMode) {
      resetForm();
    }
  }, [isOpen, editMode, editJOId]);

  const getKetentuanInsheet = (rawDruk: number): any => {
    const ketentuan = ketentuanInsheetData.find((k) => {
      const batasBawah = parseInt(k.batas_bawah);
      const batasAtas =
        k.batas_atas === '-' ? Infinity : parseInt(k.batas_atas);
      return rawDruk >= batasBawah && rawDruk <= batasAtas;
    });

    return ketentuan || { nilai: 0, is_persentase: false };
  };

  const generateSpesifikasi = (mounting: MountingData): string => {
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
    if (selectedMounting === mountingId) {
      setSelectedMounting(null);
      setFormData((prev) => ({ ...prev, spesifikasi: '' }));
      setInsheetValues({
        jumlah_druk: 0,
        jumlah_insheet_cetak: 0,
        jumlah_insheet_pond: 0,
        jumlah_insheet_finishing: 0,
        total_insheet: 0,
        jumlah_lp: 0,
      });
    } else {
      setSelectedMounting(mountingId);
      const mounting = mountingData.find((m) => m.id === mountingId);
      if (mounting) {
        const spesifikasi = generateSpesifikasi(mounting);
        setFormData((prev) => ({ ...prev, spesifikasi }));

        if (formData.qty) {
          calculateInsheetFromQty(formData.qty, mounting);
        }
      }
    }
  };

  const handleTotalInsheetChange = (totalValue: number) => {
    if (!selectedMounting) return;

    // SET FLAG to prevent auto-recalculation
    setIsManualInsheetEdit(true);

    const mounting = mountingData.find((m) => m.id === selectedMounting);
    if (!mounting) return;

    const isi = mounting.ukuran_cetak_isi_1 || 1;
    const bagian = mounting.ukuran_cetak_bagian_1 || 1;

    const totalPercentage = prosesInsheetData.reduce(
      (sum, p) => sum + p.persentase_insheet,
      0,
    );

    let cetak = 0,
      pond = 0,
      finishing = 0;

    prosesInsheetData.forEach((proses) => {
      const value = Math.ceil(
        (totalValue * proses.persentase_insheet) / totalPercentage,
      );
      const prosesName = proses.proses.toUpperCase();

      if (prosesName === 'CETAK') cetak = value;
      else if (
        prosesName === 'POND' ||
        prosesName === 'PONDS' ||
        prosesName === 'PONDING'
      )
        pond = value;
      else if (prosesName === 'FINISHING') finishing = value;
    });

    // SIMPLE REVERSE FORMULA:
    // Keep current raw druk, add new total insheet to get displayed druk
    const currentRawDruk = insheetValues.jumlah_druk;
    const displayedDruk = currentRawDruk + totalValue;

    // Qty = Displayed Druk × Isi
    const calculatedQty = displayedDruk * isi;

    // Calculate Jumlah LP
    const jumlahLP = Math.ceil(displayedDruk / bagian);

    setFormData((prev) => ({
      ...prev,
      qty: calculatedQty,
    }));

    setInsheetValues({
      jumlah_druk: currentRawDruk,
      jumlah_insheet_cetak: cetak,
      jumlah_insheet_pond: pond,
      jumlah_insheet_finishing: finishing,
      total_insheet: totalValue,
      jumlah_lp: jumlahLP,
    });
  };

  const handleQtyChange = (newQty: number) => {
    setIsManualInsheetEdit(false); // Allow recalculation when qty changes

    if (!selectedMounting) {
      setFormData((prev) => ({ ...prev, qty: newQty }));
      return;
    }

    const mounting = mountingData.find((m) => m.id === selectedMounting);
    if (mounting) {
      setFormData((prev) => ({ ...prev, qty: newQty }));
      calculateInsheetFromQty(newQty, mounting);
    }
  };

  const handleSubmit = async () => {
    if (!formData.id_so) {
      alert('Pilih SO terlebih dahulu');
      return;
    }

    if (!selectedMounting) {
      alert('Pilih mounting terlebih dahulu');
      return;
    }

    // Calculate the displayed jumlah_druk (base + insheet)
    const displayedJumlahDruk =
      insheetValues.jumlah_druk + insheetValues.total_insheet;

    // Create jo_mounting data for ALL mountings
    const joMountingData = mountingData.map((mounting) => {
      const isSelected = mounting.id === selectedMounting;

      if (isSelected) {
        // For selected mounting, use the calculated values
        return {
          id: mounting.id,
          id_jo: formData.id_jo,
          id_io_mounting: mounting.id,
          id_kertas: mounting.id_kertas,
          nama_kertas: mounting.jenis_kertas,
          gramature_kertas: mounting.gramature_kertas,
          panjang_kertas: mounting.panjang_plano,
          lebar_kertas: mounting.lebar_plano,
          jumlah_kertas: insheetValues.jumlah_lp,
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
          // Store the DISPLAYED jumlah_druk (base + insheet) for all processes
          jumlah_druk_cetak: displayedJumlahDruk,
          jumlah_insheet_cetak: insheetValues.jumlah_insheet_cetak,
          jumlah_druk_pond: displayedJumlahDruk,
          jumlah_insheet_pond: insheetValues.jumlah_insheet_pond,
          jumlah_druk_finishing: displayedJumlahDruk,
          jumlah_insheet_finishing: insheetValues.jumlah_insheet_finishing,
          total_insheet: insheetValues.total_insheet,
          is_selected: true,
        };
      } else {
        // For non-selected mountings, send minimal data
        return {
          id: mounting.id,
          id_jo: formData.id_jo,
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
          is_selected: false,
        };
      }
    });

    const submitData = {
      ...formData,
      jo_mounting: joMountingData,
    };

    try {
      setLoading(true);
      if (editMode && editJOId) {
        const url = `${import.meta.env.VITE_API_LINK}/ppic/jo/${editJOId}`;
        const res: AxiosResponse = await axios.put(url, submitData, {
          withCredentials: true,
        });
        if (res.data.success || res.data.succes) {
          alert('JO berhasil diupdate');
          setHasUnsavedChanges(false);
          onSuccess();
          onClose();
        }
        console.log('Edit JO submit data:', submitData);
      } else {
        const url = `${import.meta.env.VITE_API_LINK}/ppic/jo`;
        const res: AxiosResponse = await axios.post(url, submitData, {
          withCredentials: true,
        });
        if (res.data.success || res.data.succes) {
          alert('JO berhasil dibuat');
          setHasUnsavedChanges(false);
          onSuccess();
          onClose();
        }
        console.log('Create JO submit data:', submitData);
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
        resetForm();
        onClose();
      }
    } else {
      resetForm();
      onClose();
    }
  };

  const selectedMountingData = selectedMounting
    ? mountingData.find((m) => m.id === selectedMounting)
    : null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="flex items-center justify-center w-full h-full px-4 py-4">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />

        {/* TWO COLUMN LAYOUT */}
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

          {/* Body - Two Column Layout */}
          <div className="flex-1 overflow-hidden flex">
            {/* LEFT COLUMN - Basic Info & Production Details */}
            <div className="w-1/3 border-r overflow-y-auto p-6 bg-gray-50">
              <div className="space-y-6">
                <BasicInfoSection
                  formData={formData}
                  soData={soData}
                  onSOChange={handleSOChange}
                  loadingMounting={loadingMounting}
                  editMode={editMode}
                />

                <ProductionDetailsSection
                  formData={formData}
                  onChange={handleFieldChange}
                  onQtyChange={handleQtyChange}
                />
              </div>
            </div>

            {/* RIGHT COLUMN - Mounting Selection & Insheet Calculation */}
            <div className="w-2/3 overflow-y-auto p-6">
              <div className="space-y-6">
                <MountingSection
                  mountingData={mountingData}
                  selectedMounting={selectedMounting}
                  onMountingSelect={handleMountingSelect}
                  loadingMounting={loadingMounting}
                  insheetValues={insheetValues}
                />

                {selectedMountingData && (
                  <InsheetCalculationSection
                    mounting={selectedMountingData}
                    qty={formData.qty || 0}
                    ketentuanInsheetData={ketentuanInsheetData}
                    prosesInsheetData={prosesInsheetData}
                    insheetValues={insheetValues}
                    onTotalInsheetChange={handleTotalInsheetChange}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 flex-shrink-0">
            <button
              onClick={handleClose}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedMounting}
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
